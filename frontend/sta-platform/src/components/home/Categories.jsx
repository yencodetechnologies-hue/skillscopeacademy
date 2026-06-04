const categories = [
  {
    image:
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd',

    title: 'Earthmoving Courses',
  },

  {
    image:
      'https://images.unsplash.com/photo-1517048676732-d65bc937f952',

    title: 'Confined Space Courses',
  },

  {
    image:
      'https://images.unsplash.com/photo-1503387762-592deb58ef4e',

    title: 'Demolition Courses',
  },

  {
    image:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216',

    title: 'First Aid Courses',
  },
]

function CourseCategories() {
  return (
    <section className='course-categories'>
      <div className='section-title'>
        <h2>Popular Categories</h2>
      </div>

      <div className='categories-grid'>
        {categories.map((item, index) => (
          <div className='category-card' key={index}>
            <img src={item.image} alt={item.title} />

            <h3>{item.title}</h3>
          </div>
        ))}
      </div>
    </section>
  )
}

export default CourseCategories