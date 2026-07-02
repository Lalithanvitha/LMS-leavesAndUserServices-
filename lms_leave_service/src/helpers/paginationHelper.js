const pagination = async (model, page, limit) => {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 15;
  const offset = (page - 1) * limit;
  const result = await model.limit(perPage).offset(offset);
  const total = await model.resultSize();
  return {
    data: result,
    message: "Results fetched successfully",
    error: false,
    per_page: perPage,
    page_number: currentPage,
    total_records: total,
  };
};

const paginationMongodb = async (data, page, limit) => {
  const currentPage = parseInt(page) || 1;
  const perPage = parseInt(limit) || 15;

  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;

  const paginatedData = data.slice(startIndex, endIndex);

  return {
    data: paginatedData,
    message: "Results fetched successfully",
    error: false,
    per_page: perPage,
    page_number: currentPage,
    total_records: data.length,
    total_pages: Math.ceil(data.length / perPage),
  };
};
module.exports = { pagination, paginationMongodb };
