import { useState } from 'react'
import { gql, useMutation } from '@apollo/client'
import Select from 'react-select'

const SET_BORN = gql`
    mutation EditAuthor($name: String!, $born: Int!){
        editAuthor(
            name: $name
            setBornTo: $born
        )
    {
        name
        born
        bookCount
      }
    }
`;

const ALL_AUTHORS = gql`
  query {
    allAuthors{
      name
      born
      bookCount
    }
  }
`;

const SetBorn = ({ show, authors }) => {
    const [name, setName] = useState('')
    const [borne, setBorn] = useState('')

    const [updateAuthor] = useMutation(SET_BORN, {
        refetchQueries: [ { query: ALL_AUTHORS}]})

    if (!show) {
        return null
    }

    let options = [];
    for(let a in authors){
        options.push({value: authors[a].name, label: authors[a].name })
    }

    const submit = async (event) => {
        event.preventDefault();

        console.log(name)
        const born = Number(borne)
        await updateAuthor({ variables: { name, born } })

        setName('')
        setBorn('')

    }

    return (
        <div>
            <h1>Set birthyear</h1>
            <form onSubmit={submit}>

                <Select options={options} onChange={value => setName(value.value)}/>
                <div>
                    Born
                    <input
                        type="number"
                        value={borne}
                        onChange={({ target }) => setBorn(target.value)}
                    />
                </div>

                <button type="submit">Edit Author</button>
            </form>
        </div>
    )
}

export default SetBorn;