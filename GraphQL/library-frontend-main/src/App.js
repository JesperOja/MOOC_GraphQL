import { useState } from 'react'
import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import { gql, useQuery, useApolloClient } from '@apollo/client'
import SetBorn from './components/SetBorn'
import Login from './components/Login'
import Recommends from './components/Recommends'


const ALL_AUTHORS = gql`
  query {
    allAuthors{
      name
      born
      bookCount
    }
  }
`;

const ALL_BOOKS = gql`
  query {
    allBooks{
      author{
        name
      }
      title
      published
      genres
    }
  }
`

const ME = gql`
query{
    me{
        username
        favoriteGenre
    }
}
`


const Notify = ({ errorMessage }) => {
  if (!errorMessage) {
    return null
  }
  return <div style={{ color: 'red' }}>{errorMessage}</div>
}

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const client = useApolloClient()

  const logout = () => {
    setToken(null)
    localStorage.clear()
    client.resetStore()
  }
  
  const authors = useQuery(ALL_AUTHORS);
  const books = useQuery(ALL_BOOKS)
  const user = useQuery(ME)

  if (authors.loading)  {
    return <div>loading...</div>
  }

  const notify = (message) => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 10000)
  }

  if (!token) {
    return (
      <div>
        <Notify errorMessage={errorMessage} />
        <h2>Login</h2>
        <Login
          setToken={setToken}
          setError={notify}
        />
      </div>
    )
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        <button onClick={() => setPage('add')}>add book</button>
        <button onClick={() => setPage('recommends')}>recommendation</button>
        <button onClick={logout}>logout</button>
      </div>

      <Notify errorMessage={errorMessage} />
      <Authors show={page === 'authors'} authors={authors.data.allAuthors}/>
      <SetBorn show={page === 'authors'} authors={authors.data.allAuthors}/>
      <Books show={page === 'books'} books={books.data.allBooks}/>
      <Recommends show={page === 'recommends'} books={books.data.allBooks} user={user}/>

      <NewBook show={page === 'add'} />
    </div>
  )
}

export default App
