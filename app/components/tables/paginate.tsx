export function Paginate({ page = 1, perPage = 10, items }) {
  var offset = perPage * (page - 1);
  var totalPages = Math.ceil(items.length / perPage);
  var paginatedItems = items.slice(offset, perPage * page);
  return {
    totalPages: totalPages,
    items: paginatedItems,
  };
}
