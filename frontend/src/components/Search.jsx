import { useState } from "react";
import styles from "./Search.module.css";

export default function Search() {
  const [search, setSearch] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log(search);
    setSearch("");
  };

  return (
    <form action="/search?" onSubmit={handleSearch} className={styles.searchBox}>
      <input
        className={styles.searchInput}
        type="search"
        name="q"
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className={styles.searchButton} type="submit">
        <i className="material-icons">search</i>
      </button>
    </form>
  );
}


