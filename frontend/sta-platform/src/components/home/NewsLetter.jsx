function Newsletter() {
  return (
    <section className='newsletter'>
      <div>
        <p className='section-subtitle'>
          Subscribe Newsletter
        </p>

        <h2>Get Every Latest Updates</h2>
      </div>

      <form className='newsletter-form'>
        <input
          type='email'
          placeholder='Enter your email'
        />

        <button>Subscribe</button>
      </form>
    </section>
  )
}

export default Newsletter