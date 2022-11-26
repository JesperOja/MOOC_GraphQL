import { useState } from "react";

const Books = (props) => {
  const [filter, setFilter] = useState('')
  const [filterMessage, setFilterMessage] = useState('All genres')

  if (!props.show) {
    return null
  }

  let books = props.books

  if(filter !== ''){
    books = books.filter(book => book.genres.includes(filter))
  }

  const genreFilter = (genre) => {
    setFilter(genre)
    setFilterMessage(`in genre ${genre}`)
  }
  
  return (
    <div>
      <h2>books</h2>
      <h4>{filterMessage}</h4>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
            <th>genres</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
              <td>{a.genres}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={() => genreFilter("Fantasy")}>Fantasy</button>
      <button onClick={() => genreFilter("SciFi")}>SciFi</button>
      <button onClick={() => genreFilter("Tech")}>Tech</button>
      <button onClick={() => genreFilter("Action")}>Action</button>
    </div>
  )
}

export default Books
