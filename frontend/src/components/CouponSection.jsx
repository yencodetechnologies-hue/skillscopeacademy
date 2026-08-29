import React, { useEffect, useState, useCallback, useRef } from 'react';
import '../styles/CouponSection.css';
import { FiEdit2, FiTrash2, FiEye, FiChevronDown, FiX } from 'react-icons/fi';
import { API_URL } from "../data/service";
// ---- Config: point these at your own APIs ----
const COURSES_API = `${API_URL}/api/courses`;
const COUPONS_API = `${API_URL}/api/coupons`;

const TYPE_OPTIONS = ['individual', 'company'];

function generateCouponCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';

  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }

  return code;
}

function formatDate(d) {
  if (!d) return '—';

  const date = new Date(d);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Formats a date for a <input type="date"> value (YYYY-MM-DD),
// using local date parts so it doesn't shift a day due to UTC
// conversion.
function toDateInputValue(d) {
  if (!d) return '';

  const date = new Date(d);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function isExpired(coupon) {
  const now = new Date();

  return (
    coupon.status === 'Inactive' ||
    now < new Date(coupon.validFrom) ||
    now > new Date(coupon.validUntil)
  );
}

// Normalizes coupon.type to an array, whether it's stored as a
// string (old data) or an array (new data).
function getCouponTypes(coupon) {
  if (Array.isArray(coupon.type)) {
    return coupon.type;
  }

  return coupon.type ? [coupon.type] : [];
}

function formatTypes(type) {
  const arr = Array.isArray(type) ? type : type ? [type] : [];

  if (arr.length === 0) {
    return '—';
  }

  return arr
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))
    .join(', ');
}

// A stable key for "which courses this coupon applies to", used to
// group coupons that cover the exact same set of courses (e.g. one
// Individual coupon + one Company coupon on the same course) into a
// single merged row in the coupons table.
function getCoursesKey(coupon) {
  return (coupon.courses || [])
    .map((c) => String(c.courseId))
    .filter(Boolean)
    .sort()
    .join('|');
}

// Groups coupons by the exact set of courses they apply to. Coupons
// with no courses (shouldn't normally happen) are kept as their own
// single-item group rather than being grouped together.
function groupCouponsByCourses(coupons) {
  const groups = new Map();
  const order = [];

  coupons.forEach((coupon) => {
    const key = getCoursesKey(coupon) || `_${coupon._id}`;

    if (!groups.has(key)) {
      groups.set(key, []);
      order.push(key);
    }

    groups.get(key).push(coupon);
  });

  return order.map((key) => groups.get(key));
}

const initialForm = {
  couponCode: generateCouponCode(),
  status: 'Active',

  // FIXED AMOUNT DISCOUNT
  discountAmount: '',

  types: [], // 'individual' and/or 'company' — checkbox multi-select
  validFrom: '',
  validUntil: '',
};

const PAGE_LIMIT = 8;

function CouponSection() {
  // ============================================================
  // COURSES STATE (loaded in the background to power the course
  // picker dropdown inside the Add coupon modal — there's no
  // standalone course table on the page anymore)
  // ============================================================

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());

  // Search box that lives INSIDE the course picker dropdown.
  const [courseSearchInput, setCourseSearchInput] = useState('');

  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const courseDropdownRef = useRef(null);

  // Same picker, reused inside the Edit coupon modal.
  const [editSelectedIds, setEditSelectedIds] = useState(new Set());
  const [editCourseSearchInput, setEditCourseSearchInput] = useState('');
  const [editCourseDropdownOpen, setEditCourseDropdownOpen] = useState(false);
  const editCourseDropdownRef = useRef(null);

  // ============================================================
  // ADD COUPON MODAL STATE
  // ============================================================

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(initialForm);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveSuccess, setSaveSuccess] = useState('');

  // ============================================================
  // EDIT COUPON MODAL STATE
  // ============================================================
  // Editing an existing coupon: code, status, discount, type,
  // courses, and dates are all editable. Type is limited to the
  // coupon's own current type(s) plus any type not already
  // covered by a *different* coupon on the same course set, and
  // courses can be freely reselected from the picker (courses
  // already covered by a DIFFERENT coupon can't be picked).
  // ============================================================

  const [editCoupon, setEditCoupon] = useState(null);
  const [editForm, setEditForm] = useState(initialForm);
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState('');

  // ============================================================
  // DELETE STATE
  // ============================================================

  const [deletingId, setDeletingId] = useState(null);

  // ============================================================
  // COUPONS LIST STATE
  // ============================================================

  const [coupons, setCoupons] = useState([]);
  const [couponsLoading, setCouponsLoading] = useState(true);
  const [couponsError, setCouponsError] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [statusFilter, setStatusFilter] = useState('all');

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  // ============================================================
  // VIEW COUPON MODAL STATE
  // ============================================================

  const [viewCoupon, setViewCoupon] = useState(null);

  // ============================================================
  // LOAD COURSES
  // ============================================================

  useEffect(() => {
    let cancelled = false;

    const loadCourses = async () => {
      try {
        setLoadingCourses(true);
        setCoursesError('');

        const res = await fetch(COURSES_API);

        if (!res.ok) {
          throw new Error('Failed to load courses.');
        }

        const data = await res.json();

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.data)
            ? data.data
            : [];

        if (!cancelled) {
          setCourses(list);
        }
      } catch (error) {
        if (!cancelled) {
          setCoursesError(
            error.message || 'Failed to load courses.'
          );
        }
      } finally {
        if (!cancelled) {
          setLoadingCourses(false);
        }
      }
    };

    loadCourses();

    return () => {
      cancelled = true;
    };
  }, []);

  // ============================================================
  // CLOSE COURSE DROPDOWN ON OUTSIDE CLICK
  // ============================================================

  useEffect(() => {
    if (!courseDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        courseDropdownRef.current &&
        !courseDropdownRef.current.contains(event.target)
      ) {
        setCourseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [courseDropdownOpen]);

  useEffect(() => {
    if (!editCourseDropdownOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (
        editCourseDropdownRef.current &&
        !editCourseDropdownRef.current.contains(event.target)
      ) {
        setEditCourseDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () =>
      document.removeEventListener('mousedown', handleClickOutside);
  }, [editCourseDropdownOpen]);

  // ============================================================
  // COUPON SEARCH DEBOUNCE
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ============================================================
  // FETCH COUPONS
  // ============================================================

  const fetchCoupons = useCallback(async () => {
    try {
      setCouponsLoading(true);
      setCouponsError('');

      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_LIMIT),
      });

      if (search) {
        params.set('search', search);
      }

      if (statusFilter !== 'all') {
        params.set('status', statusFilter);
      }

      const res = await fetch(
        `${COUPONS_API}?${params.toString()}`
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to load coupons.'
        );
      }

      setCoupons(
        Array.isArray(data.data) ? data.data : []
      );

      setPages(
        Math.max(
          1,
          Number(data.pagination?.pages) || 1
        )
      );

      setTotal(
        Number(data.pagination?.total) || 0
      );
    } catch (error) {
      setCouponsError(
        error.message || 'Failed to load coupons.'
      );
    } finally {
      setCouponsLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    fetchCoupons();
  }, [fetchCoupons]);

  // ============================================================
  // PER-COURSE COUPON COVERAGE
  // ============================================================
  // Maps courseId -> Set of types ('individual' | 'company') that
  // already have an active coupon for that course. As soon as a
  // course has ANY active coupon (covering at least one type), the
  // course is considered "used up" and can't be picked again — it
  // can only get a different type via the Edit action on the
  // existing coupon, not by creating a new one.
  // ============================================================

  const courseTypeCoverage = new Map();

  // courseId -> Set of coupon _id (string) that actively cover it —
  // lets the Edit picker tell "covered by THIS coupon" (fine, keep
  // it selected) apart from "covered by a DIFFERENT coupon" (can't
  // be picked).
  const courseCouponIds = new Map();

  coupons
    .filter((coupon) => !isExpired(coupon))
    .forEach((coupon) => {
      const types = getCouponTypes(coupon);

      (coupon.courses || []).forEach((course) => {
        if (!course.courseId) {
          return;
        }

        const id = String(course.courseId);

        if (!courseTypeCoverage.has(id)) {
          courseTypeCoverage.set(id, new Set());
        }

        types.forEach((t) => {
          courseTypeCoverage.get(id).add(t);
        });

        if (!courseCouponIds.has(id)) {
          courseCouponIds.set(id, new Set());
        }

        courseCouponIds.get(id).add(String(coupon._id));
      });
    });

  // A course is "covered" (and unpickable) as soon as it has any
  // active coupon at all, regardless of type.
  const isCourseFullyCovered = (courseId) => {
    const covered = courseTypeCoverage.get(String(courseId));
    return !!covered && covered.size > 0;
  };

  // Same idea, but used inside the Edit modal: a course counts as
  // "taken" only if a coupon OTHER than the one being edited covers
  // it — so the coupon's own current courses stay pickable.
  const isCourseCoveredByOtherCoupon = (courseId, excludeCouponId) => {
    const ids = courseCouponIds.get(String(courseId));

    if (!ids || ids.size === 0) {
      return false;
    }

    if (!excludeCouponId) {
      return true;
    }

    return [...ids].some((id) => id !== String(excludeCouponId));
  };

  // ============================================================
  // COURSE FILTERING (for the picker dropdown's search box)
  // ============================================================

  const courseSearch = courseSearchInput.trim().toLowerCase();

  const filteredCourses = courses.filter((course) => {
    if (!courseSearch) {
      return true;
    }

    const haystack = `
      ${course.title || ''}
      ${course.courseCode || ''}
      ${course.category || ''}
    `.toLowerCase();

    return haystack.includes(courseSearch);
  });

  const editCourseSearch = editCourseSearchInput.trim().toLowerCase();

  const filteredEditCourses = courses.filter((course) => {
    if (!editCourseSearch) {
      return true;
    }

    const haystack = `
      ${course.title || ''}
      ${course.courseCode || ''}
      ${course.category || ''}
    `.toLowerCase();

    return haystack.includes(editCourseSearch);
  });

  // ============================================================
  // SELECTED COURSES
  // ============================================================

  const selectedCourses = courses.filter((course) =>
    selectedIds.has(String(course._id))
  );

  const editSelectedCourses = courses.filter((course) =>
    editSelectedIds.has(String(course._id))
  );

  // ============================================================
  // COURSE SELECTION HANDLERS
  // ============================================================

  const toggleCourse = (id) => {
    const normalizedId = String(id);

    if (isCourseFullyCovered(normalizedId)) {
      return;
    }

    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(normalizedId)) {
        next.delete(normalizedId);
      } else {
        next.add(normalizedId);
      }

      return next;
    });
  };

  const removeSelectedCourse = (id) => {
    const normalizedId = String(id);

    setSelectedIds((previous) => {
      const next = new Set(previous);
      next.delete(normalizedId);
      return next;
    });
  };

  // Same pair of handlers, for the Edit modal's course picker.
  const toggleEditCourse = (id) => {
    const normalizedId = String(id);

    if (
      isCourseCoveredByOtherCoupon(normalizedId, editCoupon?._id)
    ) {
      return;
    }

    setEditSelectedIds((previous) => {
      const next = new Set(previous);

      if (next.has(normalizedId)) {
        next.delete(normalizedId);
      } else {
        next.add(normalizedId);
      }

      return next;
    });
  };

  const removeEditSelectedCourse = (id) => {
    const normalizedId = String(id);

    setEditSelectedIds((previous) => {
      const next = new Set(previous);
      next.delete(normalizedId);
      return next;
    });
  };

  // ============================================================
  // ADD COUPON MODAL
  // ============================================================

  const openModal = () => {
    setForm({
      ...initialForm,
      couponCode: generateCouponCode(),
      types: [],
    });

    setSelectedIds(new Set());
    setCourseSearchInput('');
    setCourseDropdownOpen(false);

    setSaveError('');
    setSaveSuccess('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) {
      setModalOpen(false);
      setCourseDropdownOpen(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleType = (type) => {
    setForm((previous) => {
      const has = previous.types.includes(type);

      return {
        ...previous,
        types: has
          ? previous.types.filter((t) => t !== type)
          : [...previous.types, type],
      };
    });
  };

  const regenerateCode = () => {
    setForm((previous) => ({
      ...previous,
      couponCode: generateCouponCode(),
    }));
  };

  // ============================================================
  // SAVE (CREATE) COUPON
  // ============================================================

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');

    if (!form.couponCode.trim()) {
      setSaveError('Coupon code is required.');
      return;
    }

    // FIXED AMOUNT VALIDATION
    if (
      form.discountAmount === '' ||
      form.discountAmount === null ||
      Number.isNaN(Number(form.discountAmount))
    ) {
      setSaveError('Discount amount is required.');
      return;
    }

    if (Number(form.discountAmount) <= 0) {
      setSaveError(
        'Discount amount must be greater than 0.'
      );
      return;
    }

    if (!form.types || form.types.length === 0) {
      setSaveError(
        'Select at least one type: Individual and/or Company.'
      );
      return;
    }

    if (!form.validFrom || !form.validUntil) {
      setSaveError(
        'Please set both Valid from and Valid until dates.'
      );
      return;
    }

    if (
      new Date(form.validUntil) <
      new Date(form.validFrom)
    ) {
      setSaveError(
        'Valid until date cannot be before valid from date.'
      );
      return;
    }

    if (selectedCourses.length === 0) {
      setSaveError(
        'Select at least one course from the dropdown first.'
      );
      return;
    }

    // Since a course can't be picked once it has any active
    // coupon, this is mostly a safety net against stale selection
    // state (e.g. another tab just added a coupon).
    const conflictingCourse = selectedCourses.find((course) =>
      isCourseFullyCovered(course._id)
    );

    if (conflictingCourse) {
      setSaveError(
        `"${conflictingCourse.title}" already has an active coupon. Refresh and try again.`
      );
      return;
    }

    setSaving(true);

    try {
      const payload = {
        couponCode: form.couponCode.trim(),
        status: form.status,

        // FIXED AMOUNT
        discountAmount: Number(form.discountAmount),

        type: form.types,
        validFrom: form.validFrom,
        validUntil: form.validUntil,

        courses: selectedCourses.map((course) => ({
          courseId: course._id,
          courseCode: course.courseCode,
          title: course.title,
        })),
      };

      const res = await fetch(COUPONS_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to save coupon.'
        );
      }

      setSaveSuccess(
        'Coupon saved successfully.'
      );

      // Clear selected courses after successful save.
      setSelectedIds(new Set());

      // Refresh coupon list.
      setPage(1);

      await fetchCoupons();

      // Close modal after short delay.
      setTimeout(() => {
        setModalOpen(false);
      }, 900);
    } catch (error) {
      setSaveError(
        error.message || 'Failed to save coupon.'
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // EDIT COUPON MODAL
  // ============================================================
  // A course can only ever have ONE active coupon at a time (see
  // isCourseFullyCovered / isCourseCoveredByOtherCoupon above), so
  // once picked into a coupon there's no other coupon left to
  // conflict on type — every type option stays selectable here.
  // ============================================================

  const openEditModal = (coupon) => {
    setEditCoupon(coupon);

    setEditForm({
      couponCode: coupon.couponCode,
      status: coupon.status,
      discountAmount: String(coupon.discountAmount ?? ''),
      types: getCouponTypes(coupon),
      validFrom: toDateInputValue(coupon.validFrom),
      validUntil: toDateInputValue(coupon.validUntil),
    });

    setEditSelectedIds(
      new Set(
        (coupon.courses || [])
          .map((c) => c && c.courseId)
          .filter(Boolean)
          .map(String)
      )
    );
    setEditCourseSearchInput('');
    setEditCourseDropdownOpen(false);

    setEditError('');
    setEditSuccess('');
  };

  const closeEditModal = () => {
    if (!editSaving) {
      setEditCoupon(null);
      setEditCourseDropdownOpen(false);
    }
  };

  const handleEditChange = (event) => {
    const { name, value } = event.target;

    setEditForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const toggleEditType = (type) => {
    setEditForm((previous) => {
      const has = previous.types.includes(type);

      return {
        ...previous,
        types: has
          ? previous.types.filter((t) => t !== type)
          : [...previous.types, type],
      };
    });
  };

  const handleEditSave = async () => {
    if (!editCoupon) {
      return;
    }

    setEditError('');
    setEditSuccess('');

    if (!editForm.couponCode.trim()) {
      setEditError('Coupon code is required.');
      return;
    }

    if (
      editForm.discountAmount === '' ||
      editForm.discountAmount === null ||
      Number.isNaN(Number(editForm.discountAmount)) ||
      Number(editForm.discountAmount) <= 0
    ) {
      setEditError('Discount amount must be greater than 0.');
      return;
    }

    if (!editForm.types || editForm.types.length === 0) {
      setEditError(
        'Select at least one type: Individual and/or Company.'
      );
      return;
    }

    if (!editForm.validFrom || !editForm.validUntil) {
      setEditError(
        'Please set both Valid from and Valid until dates.'
      );
      return;
    }

    if (
      new Date(editForm.validUntil) < new Date(editForm.validFrom)
    ) {
      setEditError(
        'Valid until date cannot be before valid from date.'
      );
      return;
    }

    if (editSelectedCourses.length === 0) {
      setEditError(
        'Select at least one course from the dropdown.'
      );
      return;
    }

    // Safety net against stale selection state — a course picked
    // here should never actually be covered by a DIFFERENT coupon,
    // since the picker disables those, but re-check in case
    // something changed elsewhere in the meantime.
    const conflictingCourse = editSelectedCourses.find((course) =>
      isCourseCoveredByOtherCoupon(course._id, editCoupon._id)
    );

    if (conflictingCourse) {
      setEditError(
        `"${conflictingCourse.title}" already has another active coupon. Refresh and try again.`
      );
      return;
    }

    setEditSaving(true);

    try {
      const payload = {
        couponCode: editForm.couponCode.trim(),
        status: editForm.status,
        discountAmount: Number(editForm.discountAmount),
        type: editForm.types,
        validFrom: editForm.validFrom,
        validUntil: editForm.validUntil,
        courses: editSelectedCourses.map((course) => ({
          courseId: course._id,
          courseCode: course.courseCode,
          title: course.title,
        })),
      };

      const res = await fetch(
        `${COUPONS_API}/${editCoupon._id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.message || 'Failed to update coupon.'
        );
      }

      setEditSuccess('Coupon updated successfully.');

      await fetchCoupons();

      setTimeout(() => {
        setEditCoupon(null);
      }, 900);
    } catch (error) {
      setEditError(
        error.message || 'Failed to update coupon.'
      );
    } finally {
      setEditSaving(false);
    }
  };

  // ============================================================
  // DELETE COUPON
  // ============================================================

  const handleDelete = async (coupon) => {
    const confirmed = window.confirm(
      `Delete coupon "${coupon.couponCode}"? This cannot be undone.`
    );

    if (!confirmed) {
      return;
    }

    setDeletingId(coupon._id);

    try {
      const res = await fetch(
        `${COUPONS_API}/${coupon._id}`,
        { method: 'DELETE' }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok || (data && data.success === false)) {
        throw new Error(
          (data && data.message) || 'Failed to delete coupon.'
        );
      }

      // If we just deleted the last item on this page, step back a
      // page so we don't land on an empty page.
      if (coupons.length === 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        await fetchCoupons();
      }
    } catch (error) {
      window.alert(
        error.message || 'Failed to delete coupon.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ============================================================
  // COUPON PAGINATION NUMBERS
  // ============================================================

  const pageNumbers = [];

  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }

  // Coupons on the current page, merged into one row per unique
  // course set (e.g. an Individual coupon and a Company coupon on
  // the same course become a single row).
  const couponGroups = groupCouponsByCourses(coupons);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="coupon-section">

      {/* ======================================================
          COUPONS LIST HEADER
      ====================================================== */}

      <div className="coupons-list-header">

        <h2>
          Coupons ({total})
        </h2>

        <div className="coupon-search-wrap">

          <select
            className="status-filter-select"
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
          >
            <option value="all">
              All statuses
            </option>

            <option value="Active">
              Active
            </option>

            <option value="Inactive">
              Inactive
            </option>
          </select>

          <input
            className="coupon-search-input"
            placeholder="Search by code or course..."
            value={searchInput}
            onChange={(event) =>
              setSearchInput(event.target.value)
            }
          />

          <button
            className="btn-add-coupon"
            onClick={openModal}
          >
            + Add coupon
          </button>

        </div>
      </div>

      {/* ======================================================
          COUPONS TABLE
      ====================================================== */}

      <div className="coupons-table-wrap">

        {couponsLoading && (
          <div className="empty-state">
            Loading coupons...
          </div>
        )}

        {couponsError && (
          <div className="empty-state">
            {couponsError}
          </div>
        )}

        {!couponsLoading && !couponsError && (
          <table className="coupons-table">

            <thead>
              <tr>
                <th>Code</th>
                <th>Status</th>
                <th>Discount</th>
                <th>Type</th>
                <th>Applies to</th>
                <th>Valid until</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {couponGroups.map((group) => {
                const groupKey = group
                  .map((c) => c._id)
                  .join('-');

                return (
                  <tr key={groupKey}>

                    <td>
                      <div className="code-pill-stack">
                        {group.map((coupon) => (
                          <span
                            className="code-pill"
                            key={coupon._id}
                          >
                            {coupon.couponCode}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className="status-stack">
                        {group.map((coupon) => (
                          <span
                            key={coupon._id}
                            className={`badge ${
                              isExpired(coupon)
                                ? 'badge-red'
                                : 'badge-green'
                            }`}
                          >
                            {isExpired(coupon)
                              ? 'Expired'
                              : 'Active'}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* FIXED AMOUNT DISPLAY — one line per coupon
                        in the group, labelled by its type(s) */}
                    <td>
                      <div className="discount-stack">
                        {group.map((coupon) => (
                          <div key={coupon._id}>
                            $
                            {Number(
                              coupon.discountAmount || 0
                            ).toFixed(2)}
                            {group.length > 1 && (
                              <span className="discount-type-note">
                                {' '}
                                ({formatTypes(coupon.type)})
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className="type-stack">
                        {group.map((coupon) => (
                          <div key={coupon._id}>
                            {formatTypes(coupon.type)}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>
                      {group[0].courses?.length || 0}{' '}
                      course(s)
                    </td>

                    <td>
                      <div className="valid-until-stack">
                        {group.map((coupon) => (
                          <div key={coupon._id}>
                            {formatDate(coupon.validUntil)}
                          </div>
                        ))}
                      </div>
                    </td>

                    <td>
                      <div className="row-actions-stack">
                        {group.map((coupon) => (
                          <div
                            className="row-actions"
                            key={coupon._id}
                          >
                            {/* Edit */}
                            <button
                              className="coupon-action-btn coupon-edit-btn"
                              onClick={() => openEditModal(coupon)}
                              title="Edit coupon"
                              aria-label="Edit coupon"
                            >
                              <FiEdit2 size={16} strokeWidth={2} />
                            </button>

                            {/* Delete */}
                            <button
                              className="coupon-action-btn coupon-delete-btn"
                              onClick={() => handleDelete(coupon)}
                              disabled={deletingId === coupon._id}
                              title="Delete coupon"
                              aria-label="Delete coupon"
                            >
                              {deletingId === coupon._id ? (
                                <span className="delete-spinner"></span>
                              ) : (
                                <FiTrash2 size={16} strokeWidth={2} />
                              )}
                            </button>
                          </div>
                        ))}

                        {/* View */}
                        <button
                          className="coupon-action-btn coupon-view-btn"
                          onClick={() => setViewCoupon(group)}
                          title="View coupon"
                          aria-label="View coupon"
                        >
                          <FiEye size={16} strokeWidth={2} />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}

              {couponGroups.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="empty-state"
                  >
                    No coupons found.
                  </td>
                </tr>
              )}

            </tbody>

          </table>
        )}
      </div>

      {/* ======================================================
          COUPON PAGINATION
      ====================================================== */}

      {!couponsLoading &&
        !couponsError &&
        total > 0 && (
          <div className="pagination-bar">

            <span>
              Showing{' '}
              {(page - 1) * PAGE_LIMIT + 1}
              –
              {Math.min(
                page * PAGE_LIMIT,
                total
              )}{' '}
              of {total}
            </span>

            <div className="pagination-controls">

              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() =>
                  setPage((p) =>
                    Math.max(1, p - 1)
                  )
                }
              >
                ‹
              </button>

              {pageNumbers.map((number) => (
                <button
                  key={number}
                  className={`page-btn ${
                    number === page
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setPage(number)
                  }
                >
                  {number}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={page === pages}
                onClick={() =>
                  setPage((p) =>
                    Math.min(pages, p + 1)
                  )
                }
              >
                ›
              </button>

            </div>
          </div>
        )}

      {/* ======================================================
          ADD COUPON MODAL
      ====================================================== */}

      {modalOpen && (
        <div
          className="coupon-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="coupon-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Header */}
            <div className="coupon-modal-header">

              <h3>
                Add coupon
              </h3>

              <button
                className="modal-close-btn"
                onClick={closeModal}
                disabled={saving}
              >
                ✕
              </button>

            </div>

            {/* Form */}
            <div className="coupon-form-grid">

              {/* Coupon code */}
              <div className="coupon-field">

                <label>
                  Coupon code
                </label>

                <div className="coupon-code-row">

                  <input
                    name="couponCode"
                    value={form.couponCode}
                    onChange={handleChange}
                  />

                  <button
                    type="button"
                    className="regen-btn"
                    title="Regenerate code"
                    onClick={regenerateCode}
                    disabled={saving}
                  >
                    ↻
                  </button>

                </div>
              </div>

              {/* Status */}
              <div className="coupon-field">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

              </div>

              {/* Discount Amount */}
              <div className="coupon-field">

                <label>
                  Discount amount ($)
                </label>

                <input
                  type="number"
                  name="discountAmount"
                  value={form.discountAmount}
                  onChange={handleChange}
                  placeholder="100"
                  min="0"
                  step="0.01"
                />

              </div>

              {/* Type — checkboxes so a coupon can cover
                  Individual, Company, or both at once. */}
              <div className="coupon-field">

                <label>
                  Type
                </label>

                <div className="coupon-type-checkboxes">

                  {TYPE_OPTIONS.map((type) => (
                    <label
                      key={type}
                      className="coupon-type-checkbox-label"
                    >
                      <input
                        type="checkbox"
                        checked={form.types.includes(type)}
                        onChange={() => toggleType(type)}
                        disabled={saving}
                      />
                      {type.charAt(0).toUpperCase() +
                        type.slice(1)}
                    </label>
                  ))}

                </div>

              </div>

              {/* Select course — searchable checkbox dropdown,
                  with the chosen courses listed neatly underneath */}
              <div
                className="coupon-field full-width"
                ref={courseDropdownRef}
              >

                <label>
                  Select course
                </label>

                <div className="course-picker">

                  <button
                    type="button"
                    className="course-picker-trigger"
                    onClick={() =>
                      setCourseDropdownOpen((open) => !open)
                    }
                    disabled={saving || loadingCourses}
                  >
                    <span>
                      {loadingCourses
                        ? 'Loading courses...'
                        : selectedCourses.length > 0
                          ? `${selectedCourses.length} course${
                              selectedCourses.length > 1 ? 's' : ''
                            } selected`
                          : 'Select course(s)'}
                    </span>

                    <FiChevronDown
                      size={16}
                      className={`course-picker-chevron ${
                        courseDropdownOpen ? 'open' : ''
                      }`}
                    />
                  </button>

                  {courseDropdownOpen && (
                    <div className="course-picker-panel">

                      <input
                        className="course-picker-search"
                        placeholder="Search courses by title, code, or category..."
                        value={courseSearchInput}
                        onChange={(event) =>
                          setCourseSearchInput(event.target.value)
                        }
                        autoFocus
                      />

                      <div className="course-picker-list">

                        {coursesError && (
                          <div className="empty-state">
                            {coursesError}
                          </div>
                        )}

                        {!coursesError &&
                          filteredCourses.map((course) => {
                            const courseId = String(course._id);
                            const covered =
                              isCourseFullyCovered(courseId);
                            const checked =
                              selectedIds.has(courseId);

                            return (
                              <label
                                key={course._id}
                                className={`course-picker-option ${
                                  covered ? 'disabled' : ''
                                }`}
                                title={
                                  covered
                                    ? 'This course already has an active coupon.'
                                    : ''
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={covered}
                                  onChange={() =>
                                    toggleCourse(courseId)
                                  }
                                />

                                <span className="course-picker-option-text">
                                  <span className="course-picker-option-title">
                                    {course.title}
                                  </span>
                                  <span className="course-picker-option-meta">
                                    {course.courseCode}
                                    {course.category
                                      ? ` · ${course.category}`
                                      : ''}
                                    {covered ? ' · Has coupon' : ''}
                                  </span>
                                </span>
                              </label>
                            );
                          })}

                        {!coursesError &&
                          filteredCourses.length === 0 && (
                            <div className="empty-state">
                              No courses found.
                            </div>
                          )}

                      </div>
                    </div>
                  )}

                </div>

                {/* Selected courses, shown neatly as chips */}
                {selectedCourses.length > 0 && (
                  <div className="selected-course-chips">
                    {selectedCourses.map((course) => (
                      <span
                        className="selected-course-chip"
                        key={course._id}
                      >
                        {course.title}

                        <button
                          type="button"
                          className="selected-course-chip-remove"
                          onClick={() =>
                            removeSelectedCourse(course._id)
                          }
                          disabled={saving}
                          aria-label={`Remove ${course.title}`}
                        >
                          <FiX size={12} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

              </div>

              {/* Valid from */}
              <div className="coupon-field">

                <label>
                  Valid from
                </label>

                <input
                  type="date"
                  name="validFrom"
                  value={form.validFrom}
                  onChange={handleChange}
                />

              </div>

              {/* Valid until */}
              <div className="coupon-field">

                <label>
                  Valid until
                </label>

                <input
                  type="date"
                  name="validUntil"
                  value={form.validUntil}
                  onChange={handleChange}
                />

              </div>

              {/* Errors */}
              {saveError && (
                <p className="form-error">
                  {saveError}
                </p>
              )}

              {/* Success */}
              {saveSuccess && (
                <p className="form-success">
                  {saveSuccess}
                </p>
              )}

            </div>

            {/* Footer */}
            <div className="coupon-modal-footer">

              <button
                className="btn-cancel"
                onClick={closeModal}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="btn-save"
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? 'Saving...'
                  : '✓ Save coupon'}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          EDIT COUPON MODAL
          Courses are locked; code, status, discount, type, and
          dates are editable. Type choices are limited to this
          coupon's own type(s) plus any type not already taken by
          a different coupon on the same course set.
      ====================================================== */}

      {editCoupon && (
        <div
          className="coupon-modal-overlay"
          onClick={closeEditModal}
        >
          <div
            className="coupon-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Header */}
            <div className="coupon-modal-header">

              <h3>
                Edit coupon — {editCoupon.couponCode}
              </h3>

              <button
                className="modal-close-btn"
                onClick={closeEditModal}
                disabled={editSaving}
              >
                ✕
              </button>

            </div>

            {/* Form */}
            <div className="coupon-form-grid">

              {/* Coupon code */}
              <div className="coupon-field">

                <label>
                  Coupon code
                </label>

                <input
                  name="couponCode"
                  value={editForm.couponCode}
                  onChange={handleEditChange}
                />

              </div>

              {/* Status */}
              <div className="coupon-field">

                <label>
                  Status
                </label>

                <select
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                >
                  <option value="Active">
                    Active
                  </option>

                  <option value="Inactive">
                    Inactive
                  </option>
                </select>

              </div>

              {/* Discount Amount */}
              <div className="coupon-field">

                <label>
                  Discount amount ($)
                </label>

                <input
                  type="number"
                  name="discountAmount"
                  value={editForm.discountAmount}
                  onChange={handleEditChange}
                  min="0"
                  step="0.01"
                />

              </div>

              {/* Type */}
              <div className="coupon-field">

                <label>
                  Type
                </label>

                <div className="coupon-type-checkboxes">

                  {TYPE_OPTIONS.map((type) => (
                    <label
                      key={type}
                      className="coupon-type-checkbox-label"
                    >
                      <input
                        type="checkbox"
                        checked={editForm.types.includes(type)}
                        onChange={() => toggleEditType(type)}
                        disabled={editSaving}
                      />
                      {type.charAt(0).toUpperCase() +
                        type.slice(1)}
                    </label>
                  ))}

                </div>

              </div>

              {/* Select course — same searchable checkbox dropdown
                  as the Add coupon modal, so courses can be
                  reselected while editing. */}
              <div
                className="coupon-field full-width"
                ref={editCourseDropdownRef}
              >

                <label>
                  Select course
                </label>

                <div className="course-picker">

                  <button
                    type="button"
                    className="course-picker-trigger"
                    onClick={() =>
                      setEditCourseDropdownOpen((open) => !open)
                    }
                    disabled={editSaving || loadingCourses}
                  >
                    <span>
                      {loadingCourses
                        ? 'Loading courses...'
                        : editSelectedCourses.length > 0
                          ? `${editSelectedCourses.length} course${
                              editSelectedCourses.length > 1
                                ? 's'
                                : ''
                            } selected`
                          : 'Select course(s)'}
                    </span>

                    <FiChevronDown
                      size={16}
                      className={`course-picker-chevron ${
                        editCourseDropdownOpen ? 'open' : ''
                      }`}
                    />
                  </button>

                  {editCourseDropdownOpen && (
                    <div className="course-picker-panel">

                      <input
                        className="course-picker-search"
                        placeholder="Search courses by title, code, or category..."
                        value={editCourseSearchInput}
                        onChange={(event) =>
                          setEditCourseSearchInput(
                            event.target.value
                          )
                        }
                        autoFocus
                      />

                      <div className="course-picker-list">

                        {coursesError && (
                          <div className="empty-state">
                            {coursesError}
                          </div>
                        )}

                        {!coursesError &&
                          filteredEditCourses.map((course) => {
                            const courseId = String(course._id);
                            const covered =
                              isCourseCoveredByOtherCoupon(
                                courseId,
                                editCoupon._id
                              );
                            const checked =
                              editSelectedIds.has(courseId);

                            return (
                              <label
                                key={course._id}
                                className={`course-picker-option ${
                                  covered ? 'disabled' : ''
                                }`}
                                title={
                                  covered
                                    ? 'This course already has another active coupon.'
                                    : ''
                                }
                              >
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  disabled={covered}
                                  onChange={() =>
                                    toggleEditCourse(courseId)
                                  }
                                />

                                <span className="course-picker-option-text">
                                  <span className="course-picker-option-title">
                                    {course.title}
                                  </span>
                                  <span className="course-picker-option-meta">
                                    {course.courseCode}
                                    {course.category
                                      ? ` · ${course.category}`
                                      : ''}
                                    {covered ? ' · Has coupon' : ''}
                                  </span>
                                </span>
                              </label>
                            );
                          })}

                        {!coursesError &&
                          filteredEditCourses.length === 0 && (
                            <div className="empty-state">
                              No courses found.
                            </div>
                          )}

                      </div>
                    </div>
                  )}

                </div>

                {/* Selected courses, shown neatly as chips */}
                {editSelectedCourses.length > 0 && (
                  <div className="selected-course-chips">
                    {editSelectedCourses.map((course) => (
                      <span
                        className="selected-course-chip"
                        key={course._id}
                      >
                        {course.title}

                        <button
                          type="button"
                          className="selected-course-chip-remove"
                          onClick={() =>
                            removeEditSelectedCourse(course._id)
                          }
                          disabled={editSaving}
                          aria-label={`Remove ${course.title}`}
                        >
                          <FiX size={12} strokeWidth={2.5} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}

              </div>

              {/* Valid from */}
              <div className="coupon-field">

                <label>
                  Valid from
                </label>

                <input
                  type="date"
                  name="validFrom"
                  value={editForm.validFrom}
                  onChange={handleEditChange}
                />

              </div>

              {/* Valid until */}
              <div className="coupon-field">

                <label>
                  Valid until
                </label>

                <input
                  type="date"
                  name="validUntil"
                  value={editForm.validUntil}
                  onChange={handleEditChange}
                />

              </div>

              {/* Errors */}
              {editError && (
                <p className="form-error">
                  {editError}
                </p>
              )}

              {/* Success */}
              {editSuccess && (
                <p className="form-success">
                  {editSuccess}
                </p>
              )}

            </div>

            {/* Footer */}
            <div className="coupon-modal-footer">

              <button
                className="btn-cancel"
                onClick={closeEditModal}
                disabled={editSaving}
              >
                Cancel
              </button>

              <button
                className="btn-save"
                onClick={handleEditSave}
                disabled={editSaving}
              >
                {editSaving
                  ? 'Saving...'
                  : '✓ Update coupon'}
              </button>

            </div>

          </div>
        </div>
      )}

      {/* ======================================================
          VIEW COUPON DETAILS MODAL
      ====================================================== */}

      {viewCoupon && (
        <div
          className="coupon-modal-overlay"
          onClick={() =>
            setViewCoupon(null)
          }
        >
          <div
            className="coupon-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* Header */}
            <div className="coupon-modal-header">

              <h3>
                Coupon details —{' '}
                {viewCoupon
                  .map((coupon) => coupon.couponCode)
                  .join(' + ')}
              </h3>

              <button
                className="modal-close-btn"
                onClick={() =>
                  setViewCoupon(null)
                }
              >
                ✕
              </button>

            </div>

            {/* One details block per coupon in the group — usually
                just one, but two when e.g. an Individual coupon and
                a Company coupon share the same courses. */}
            {viewCoupon.map((coupon) => (
              <div
                className="view-details-grid"
                key={coupon._id}
              >

                {/* Coupon code (only shown when grouped) */}
                {viewCoupon.length > 1 && (
                  <div className="detail-item full-width">
                    <span className="detail-label">
                      Coupon code
                    </span>
                    <span className="detail-value code-pill">
                      {coupon.couponCode}
                    </span>
                  </div>
                )}

                {/* Status */}
                <div className="detail-item">

                  <span className="detail-label">
                    Status
                  </span>

                  <span className="detail-value">

                    <span
                      className={`badge ${
                        isExpired(coupon)
                          ? 'badge-red'
                          : 'badge-green'
                      }`}
                    >
                      {isExpired(coupon)
                        ? 'Expired'
                        : 'Active'}
                    </span>

                  </span>

                </div>

                {/* Discount */}
                <div className="detail-item">

                  <span className="detail-label">
                    Discount
                  </span>

                  <span className="detail-value">
                    $
                    {Number(
                      coupon.discountAmount || 0
                    ).toFixed(2)}
                  </span>

                </div>

                {/* Type */}
                <div className="detail-item">

                  <span className="detail-label">
                    Type
                  </span>

                  <span className="detail-value">
                    {formatTypes(coupon.type)}
                  </span>

                </div>

                {/* Valid from */}
                <div className="detail-item">

                  <span className="detail-label">
                    Valid from
                  </span>

                  <span className="detail-value">
                    {formatDate(
                      coupon.validFrom
                    )}
                  </span>

                </div>

                {/* Valid until */}
                <div className="detail-item">

                  <span className="detail-label">
                    Valid until
                  </span>

                  <span className="detail-value">
                    {formatDate(
                      coupon.validUntil
                    )}
                  </span>

                </div>

              </div>
            ))}

            {/* Courses — shared by every coupon in the group, so
                shown once at the bottom */}
            <div className="view-courses-title">

              Courses this coupon is applied to (
              {viewCoupon[0].courses?.length || 0}
              )

            </div>

            <div className="view-courses-list">

              {(viewCoupon[0].courses || []).map(
                (course) => (
                  <div
                    className="view-course-row"
                    key={course.courseId}
                  >

                    <span className="vc-title">
                      {course.title}
                    </span>

                    <span className="vc-code">
                      {course.courseCode}
                    </span>

                  </div>
                )
              )}

              {(!viewCoupon[0].courses ||
                viewCoupon[0].courses.length ===
                  0) && (
                <div className="empty-state">
                  No courses linked.
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default CouponSection;
