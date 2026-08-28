
import React, { useEffect, useState, useCallback } from 'react';
import '../styles/CouponSection.css';

// ---- Config: point these at your own APIs ----
const COURSES_API = 'http://localhost:7001/api/courses';
const COUPONS_API = 'http://localhost:7001/api/coupons';

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

function isExpired(coupon) {
  const now = new Date();

  return (
    coupon.status === 'Inactive' ||
    now < new Date(coupon.validFrom) ||
    now > new Date(coupon.validUntil)
  );
}

const initialForm = {
  couponCode: generateCouponCode(),
  status: 'Active',

  // FIXED AMOUNT DISCOUNT
  discountAmount: '',

  type: 'individual', // 'individual' | 'company'
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
  // ACTIVE COUPON COURSE IDS
  // ============================================================

  const couponedCourseIds = new Set(
    coupons
      .filter((coupon) => !isExpired(coupon))
      .flatMap((coupon) =>
        (coupon.courses || [])
          .map((course) => course.courseId)
          .filter(Boolean)
          .map((id) => String(id))
      )
  );

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
      (course) =>
        !couponedCourseIds.has(String(course._id))
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

    if (couponedCourseIds.has(normalizedId)) {
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

  const regenerateCode = () => {
    setForm((previous) => ({
      ...previous,
      couponCode: generateCouponCode(),
    }));
  };

  // ============================================================
  // SAVE COUPON
  // ============================================================

  const handleSave = async () => {
    setSaveError('');
    setSaveSuccess('');

    // ------------------------------------------
    // Validation
    // ------------------------------------------

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

    // ------------------------------------------
    // Save
    // ------------------------------------------

    setSaving(true);

    try {
      const payload = {
        couponCode: form.couponCode.trim(),
        status: form.status,

        // FIXED AMOUNT
        discountAmount: Number(form.discountAmount),

        type: form.type,
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
  // COUPON PAGINATION NUMBERS
  // ============================================================

  const pageNumbers = [];

  for (let i = 1; i <= pages; i++) {
    pageNumbers.push(i);
  }

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

                const hasCoupon =
                  couponedCourseIds.has(courseId);

                const isSelected =
                  selectedIds.has(courseId);

                return (
                  <tr
                    key={course._id}
                    className={
                      hasCoupon
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
                        disabled={hasCoupon}
                        title={
                          hasCoupon
                            ? 'This course already has an active coupon'
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
                      {hasCoupon ? (
                        <span className="badge badge-red">
                          Has coupon
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
                <th></th>
              </tr>
            </thead>

            <tbody>

              {coupons.map((coupon) => {
                const expired =
                  isExpired(coupon);

                return (
                  <tr key={coupon._id}>

                    <td className="code-pill">
                      {coupon.couponCode}
                    </td>

                    <td>
                      <span
                        className={`badge ${
                          expired
                            ? 'badge-red'
                            : 'badge-green'
                        }`}
                      >
                        {expired
                          ? 'Expired'
                          : 'Active'}
                      </span>
                    </td>

                    {/* FIXED AMOUNT DISPLAY */}
                    <td>
                      $
                      {Number(
                        coupon.discountAmount || 0
                      ).toFixed(2)}
                    </td>

                    <td
                      style={{
                        textTransform: 'capitalize',
                      }}
                    >
                      {coupon.type}
                    </td>

                    <td>
                      {coupon.courses?.length || 0}{' '}
                      course(s)
                    </td>

                    <td>
                      {formatDate(
                        coupon.validUntil
                      )}
                    </td>

                    <td>
                      <button
                        className="btn-view"
                        onClick={() =>
                          setViewCoupon(coupon)
                        }
                      >
                        View
                      </button>
                    </td>

                  </tr>
                );
              })}

              {coupons.length === 0 && (
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

              <h3>Add coupon</h3>

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

              {/* Type */}
              <div className="coupon-field">

                <label>
                  Type
                </label>

                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="individual">
                    Individual
                  </option>

                  <option value="company">
                    Company
                  </option>
                </select>

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
                {viewCoupon.couponCode}
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

            {/* Details */}
            <div className="view-details-grid">

              {/* Status */}
              <div className="detail-item">

                <span className="detail-label">
                  Status
                </span>

                <span className="detail-value">

                  <span
                    className={`badge ${
                      isExpired(viewCoupon)
                        ? 'badge-red'
                        : 'badge-green'
                    }`}
                  >
                    {isExpired(viewCoupon)
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
                    viewCoupon.discountAmount || 0
                  ).toFixed(2)}
                </span>

              </div>

              {/* Type */}
              <div className="detail-item">

                <span className="detail-label">
                  Type
                </span>

                <span
                  className="detail-value"
                  style={{
                    textTransform:
                      'capitalize',
                  }}
                >
                  {viewCoupon.type}
                </span>

              </div>

              {/* Valid from */}
              <div className="detail-item">

                <span className="detail-label">
                  Valid from
                </span>

                <span className="detail-value">
                  {formatDate(
                    viewCoupon.validFrom
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
                    viewCoupon.validUntil
                  )}
                </span>

              </div>

            </div>

            {/* Courses */}
            <div className="view-courses-title">

              Courses this coupon is applied to (
              {viewCoupon.courses?.length || 0}
              )

            </div>

            <div className="view-courses-list">

              {(viewCoupon.courses || []).map(
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

              {(!viewCoupon.courses ||
                viewCoupon.courses.length ===
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
