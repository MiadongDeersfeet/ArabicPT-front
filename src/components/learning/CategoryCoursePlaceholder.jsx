import './CategoryCoursePlaceholder.css'

/**
 * Future Course list area — expandable shell.
 * No fake courses/progress. Editorial empty state only.
 */
function CategoryCoursePlaceholder({ title, body }) {
  return (
    <section className="catCourse" aria-labelledby="cat-course-title">
      <div className="catCourseHead">
        <h2 id="cat-course-title" className="catCourseTitle">
          학습 과정
        </h2>
        <span className="catCourseStatus">준비 중</span>
      </div>
      <div className="catCourseBody">
        <p className="catCourseLead">{title}</p>
        <p className="catCourseText">{body}</p>
      </div>
      {/* Future: Course list mounts here */}
      <div className="catCourseSlot" data-course-slot="true" hidden aria-hidden="true" />
    </section>
  )
}

export default CategoryCoursePlaceholder
