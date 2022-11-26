

const Recommends = (props) => {

    if (!props.show) {
        return null
    }

    let books = props.books

    books = books.filter(book => book.genres.includes(props.user.data.me.favoriteGenre))
    return (
        <div>
            <h2>Recommendations</h2>
            <h4>books in your favorite genre {props.user.data.me.favoriteGenre}</h4>

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

        </div>
    )
}

export default Recommends