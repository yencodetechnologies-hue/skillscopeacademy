import { FaSearch } from 'react-icons/fa'

function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className='search-bar'>
      <input
        type='text'
        placeholder={placeholder || 'Search courses'}
        value={value}
        onChange={onChange}
      />

      <button>
        <FaSearch />
      </button>
    </div>
  )
}

export default SearchBar