// export default function SearchFilters() {
//   return (
//     <div className="flex flex-wrap gap-4 my-4">
//       <select className="border rounded-lg px-4 py-2">
//         <option>Sort by: Most Upvoted</option>
//         <option>Newest First</option>
//         <option>Most Viewed</option>
//       </select>

//       <select className="border rounded-lg px-4 py-2">
//         <option>Filter by Date</option>
//         <option>Last 7 days</option>
//         <option>Last 30 days</option>
//       </select>

//       <input
//         type="text"
//         placeholder="Filter by Tag"
//         className="border rounded-lg px-4 py-2"
//       />
//     </div>
//   );
// }
export default function SearchFilters({
  sortBy,
  setSortBy,
  dateFilter,
  setDateFilter,
  tagFilter,
  setTagFilter,
}: {
  sortBy: string;
  setSortBy: (value: string) => void;
  dateFilter: string;
  setDateFilter: (value: string) => void;
  tagFilter: string;
  setTagFilter: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-4 my-4">
      <select className="border rounded-lg px-4 py-2" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="upvotes">Sort by: Most Upvoted</option>
        <option value="newest">Newest First</option>
        <option value="views">Most Viewed</option>
      </select>

      <select className="border rounded-lg px-4 py-2" value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
        <option value="">Filter by Date</option>
        <option value="7">Last 7 days</option>
        <option value="30">Last 30 days</option>
      </select>

      <input
        type="text"
        placeholder="Filter by Tag"
        className="border rounded-lg px-4 py-2"
        value={tagFilter}
        onChange={(e) => setTagFilter(e.target.value)}
      />
    </div>
  );
}