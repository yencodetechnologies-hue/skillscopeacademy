import React, { useEffect, useState, useCallback } from 'react';
import '../styles/CouponSection.css';
import { FiEdit2, FiTrash2, FiEye } from 'react-icons/fi';
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
const COURSE_PAGE_LIMIT = 5;

function CouponSection() {
  // ============================================================
  // COURSES STATE
  // ============================================================

  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [coursesError, setCoursesError] = useState('');

  const [selectedIds, setSelectedIds] = useState(new Set());

  const [courseSearchInput, setCourseSearchInput] = useState('');
  const [courseSearch, setCourseSearch] = useState('');
  const [coursePage, setCoursePage] = useState(1);

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
  // Editing an existing coupon: courses are locked (can't be
  // changed), everything else — title, code, status, discount,
  // type, dates — is editable. Type is limited to the coupon's
  // own current type(s) plus any type not already covered by a
  // *different* coupon on the same course set.
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
  // COURSE SEARCH DEBOUNCE
  // ============================================================

  useEffect(() => {
    const timer = setTimeout(() => {
      setCourseSearch(courseSearchInput.trim().toLowerCase());
      setCoursePage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [courseSearchInput]);

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
  // course is considered "used up" and its checkbox is disabled —
  // it can only get a different type via the Edit action on the
  // existing coupon, not by creating a new one.
  // ============================================================

  const courseTypeCoverage = new Map();

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
      });
    });

  // A course is "covered" (and its checkbox disabled) as soon as it
  // has any active coupon at all, regardless of type.
  const isCourseFullyCovered = (courseId) => {
    const covered = courseTypeCoverage.get(String(courseId));
    return !!covered && covered.size > 0;
  };

  // ============================================================
  // COURSE FILTERING
  // ============================================================

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

  // ============================================================
  // COURSE PAGINATION
  // ============================================================

  const coursePages = Math.max(
    1,
    Math.ceil(
      filteredCourses.length / COURSE_PAGE_LIMIT
    )
  );

  const safeCoursePage = Math.min(
    coursePage,
    coursePages
  );

  const pagedCourses = filteredCourses.slice(
    (safeCoursePage - 1) * COURSE_PAGE_LIMIT,
    safeCoursePage * COURSE_PAGE_LIMIT
  );

  // ============================================================
  // SELECTABLE COURSES ON CURRENT PAGE
  // ============================================================

  const selectablePageIds = pagedCourses
    .filter(
      (course) => !isCourseFullyCovered(course._id)
    )
    .map((course) => String(course._id));

  const allPageSelected =
    selectablePageIds.length > 0 &&
    selectablePageIds.every((id) =>
      selectedIds.has(id)
    );

  // ============================================================
  // SELECTED COURSES
  // ============================================================

  const selectedCourses = courses.filter((course) =>
    selectedIds.has(String(course._id))
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

  const toggleAll = () => {
    setSelectedIds((previous) => {
      const next = new Set(previous);

      if (allPageSelected) {
        selectablePageIds.forEach((id) => {
          next.delete(id);
        });
      } else {
        selectablePageIds.forEach((id) => {
          next.add(id);
        });
      }

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

    setSaveError('');
    setSaveSuccess('');
    setModalOpen(true);
  };

  const closeModal = () => {
    if (!saving) {
      setModalOpen(false);
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
        'Select at least one course from the table first.'
      );
      return;
    }

    // Since a course is disabled the moment it has any active
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
  // Type options available while editing: the coupon's own
  // current type(s), plus any type not already covered by a
  // *different* coupon on this exact course set.
  // ============================================================

  const getAvailableEditTypes = (coupon) => {
    const ownTypes = getCouponTypes(coupon);
    const key = getCoursesKey(coupon);

    const coveredByOthers = new Set();

    coupons
      .filter(
        (c) =>
          c._id !== coupon._id &&
          !isExpired(c) &&
          getCoursesKey(c) === key
      )
      .forEach((c) => {
        getCouponTypes(c).forEach((t) => coveredByOthers.add(t));
      });

    return TYPE_OPTIONS.filter(
      (t) => ownTypes.includes(t) || !coveredByOthers.has(t)
    );
  };

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

    setEditError('');
    setEditSuccess('');
  };

  const closeEditModal = () => {
    if (!editSaving) {
      setEditCoupon(null);
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

    setEditSaving(true);

    try {
      const payload = {
        couponCode: editForm.couponCode.trim(),
        status: editForm.status,
        discountAmount: Number(editForm.discountAmount),
        type: editForm.types,
        validFrom: editForm.validFrom,
        validUntil: editForm.validUntil,
        // courses intentionally omitted — not editable here
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
          COURSE SELECTION
      ====================================================== */}

      <div className="coupon-section-header">
        <h2>Courses</h2>
      </div>

      <div className="coupon-toolbar">
        <input
          className="coupon-search-input"
          placeholder="Search courses by title, code, or category..."
          value={courseSearchInput}
          onChange={(event) =>
            setCourseSearchInput(event.target.value)
          }
        />

        {selectedIds.size > 0 && (
          <button
            className="btn-add-coupon"
            onClick={openModal}
          >
            + Add coupon ({selectedIds.size} selected)
          </button>
        )}
      </div>

      {/* ======================================================
          COURSE TABLE
      ====================================================== */}

      <div className="course-table-wrap">

        {loadingCourses && (
          <div className="empty-state">
            Loading courses...
          </div>
        )}

        {coursesError && (
          <div className="empty-state">
            {coursesError}
          </div>
        )}

        {!loadingCourses && !coursesError && (
          <table className="course-table">

            <thead>
              <tr>
                <th style={{ width: 40 }}>
                  <input
                    type="checkbox"
                    checked={allPageSelected}
                    onChange={toggleAll}
                    disabled={
                      selectablePageIds.length === 0
                    }
                  />
                </th>

                <th>Course</th>
                <th>Category</th>
                <th>Duration</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              {pagedCourses.map((course) => {
                const courseId = String(course._id);

                const fullyCovered =
                  isCourseFullyCovered(courseId);

                const covered =
                  courseTypeCoverage.get(courseId);

                const isSelected =
                  selectedIds.has(courseId);

                return (
                  <tr
                    key={course._id}
                    className={
                      fullyCovered
                        ? 'row-disabled'
                        : ''
                    }
                  >
                    {/* Checkbox */}
                    <td>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() =>
                          toggleCourse(courseId)
                        }
                        disabled={fullyCovered}
                        title={
                          fullyCovered
                            ? 'This course already has an active coupon. Use Edit on that coupon to change its type.'
                            : ''
                        }
                      />
                    </td>

                    {/* Course */}
                    <td>
                      <div className="course-title-cell">

                        {course.image && (
                          <img
                            src={course.image}
                            alt=""
                            className="course-thumb"
                            onError={(event) => {
                              event.currentTarget.style.display =
                                'none';
                            }}
                          />
                        )}

                        <div>
                          <div className="course-title-text">
                            {course.title}
                          </div>

                          <div className="course-code">
                            {course.courseCode}
                          </div>
                        </div>

                      </div>
                    </td>

                    {/* Category */}
                    <td>
                      {course.category || '—'}
                    </td>

                    {/* Duration */}
                    <td>
                      {course.duration || '—'}
                    </td>

                    {/* Price */}
                    <td className="price-cell">
                      $
                      {course.sellingPrice ??
                        course.withExperiencePrice ??
                        '—'}
                    </td>

                    {/* Status */}
                    <td>
                      {fullyCovered ? (
                        <span className="badge badge-red">
                          {formatTypes(
                            Array.from(covered || [])
                          )}{' '}
                          — Has coupon
                        </span>
                      ) : (
                        <span className="badge badge-green">
                          Available
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {pagedCourses.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="empty-state"
                  >
                    No courses found.
                  </td>
                </tr>
              )}
            </tbody>

          </table>
        )}
      </div>

      {/* ======================================================
          COURSE PAGINATION
      ====================================================== */}

      {!loadingCourses &&
        !coursesError &&
        filteredCourses.length > 0 && (
          <div className="pagination-bar">

            <span>
              Showing{' '}
              {(safeCoursePage - 1) *
                COURSE_PAGE_LIMIT +
                1}
              –
              {Math.min(
                safeCoursePage * COURSE_PAGE_LIMIT,
                filteredCourses.length
              )}{' '}
              of {filteredCourses.length}
            </span>

            <div className="pagination-controls">

              <button
                className="page-btn"
                disabled={safeCoursePage === 1}
                onClick={() =>
                  setCoursePage((p) =>
                    Math.max(1, p - 1)
                  )
                }
              >
                ‹
              </button>

              {Array.from(
                { length: coursePages },
                (_, index) => index + 1
              ).map((number) => (
                <button
                  key={number}
                  className={`page-btn ${
                    number === safeCoursePage
                      ? 'active'
                      : ''
                  }`}
                  onClick={() =>
                    setCoursePage(number)
                  }
                >
                  {number}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={
                  safeCoursePage === coursePages
                }
                onClick={() =>
                  setCoursePage((p) =>
                    Math.min(coursePages, p + 1)
                  )
                }
              >
                ›
              </button>

            </div>
          </div>
        )}

      <div className="section-divider" />

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

              {/* Applies to */}
              <div className="coupon-field full-width">

                <label>
                  Applies to
                </label>

                <div className="selected-courses-note">

                  Applies to:{' '}

                  {selectedCourses.length > 0
                    ? selectedCourses
                        .map(
                          (course) =>
                            course.title
                        )
                        .join(', ')
                    : 'No courses selected — go back and select from the table.'}

                </div>

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
          Courses are locked; title, code, status, discount,
          type, and dates are editable. Type choices are limited
          to this coupon's own type(s) plus any type not already
          taken by a different coupon on the same course set.
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

            <p className="coupon-edit-note">
              Courses can't be changed here — this coupon stays
              applied to the same {editCoupon.courses?.length || 0}{' '}
              course(s) it was created with.
            </p>

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

                  {TYPE_OPTIONS.map((type) => {
                    const available =
                      getAvailableEditTypes(
                        editCoupon
                      ).includes(type);

                    return (
                      <label
                        key={type}
                        className="coupon-type-checkbox-label"
                      >
                        <input
                          type="checkbox"
                          checked={editForm.types.includes(
                            type
                          )}
                          onChange={() =>
                            toggleEditType(type)
                          }
                          disabled={
                            editSaving || !available
                          }
                        />
                        {type.charAt(0).toUpperCase() +
                          type.slice(1)}
                      </label>
                    );
                  })}

                </div>

              </div>

              {/* Applies to (read-only) */}
              <div className="coupon-field full-width">

                <label>
                  Applies to (locked)
                </label>

                <div className="selected-courses-note">
                  {(editCoupon.courses || [])
                    .map((c) => c.title)
                    .join(', ') || '—'}
                </div>

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

                {/* Row actions */}
                {/* <div className="detail-item full-width">
                  <button
                    className="btn-edit"
                    onClick={() => {
                      setViewCoupon(null);
                      openEditModal(coupon);
                    }}
                  >
                    Edit this coupon
                  </button>

                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(coupon)}
                    disabled={deletingId === coupon._id}
                  >
                    {deletingId === coupon._id
                      ? 'Deleting...'
                      : 'Delete this coupon'}
                  </button>
                </div> */}

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
