class ListBranchesUseCase {
  constructor(branchRepository) {
    this.branchRepository = branchRepository;
  }

  async execute(filters = {}, options = {}, user = null) {
    const {
      page = 1,
      limit = 10,
      sortBy = "name",
      sortOrder = "ASC",
      search,
      status,
      isHeadquarters,
      managerId,
    } = options;

    // Filter out undefined values for options
    const cleanOptions = {
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder: sortOrder.toUpperCase(),
    };

    if (search !== undefined) cleanOptions.search = search;
    if (status !== undefined) cleanOptions.status = status;
    if (isHeadquarters !== undefined) {
      cleanOptions.isHeadquarters =
        isHeadquarters === "true"
          ? true
          : isHeadquarters === "false"
          ? false
          : undefined;
    }
    if (managerId !== undefined) cleanOptions.managerId = managerId;

    const result = await this.branchRepository.findAll(filters, cleanOptions);

    return {
      success: true,
      data: result.branches,
      pagination: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        total: result.pagination.total,
        totalPages: result.pagination.totalPages,
      },
    };
  }
}

module.exports = ListBranchesUseCase;
