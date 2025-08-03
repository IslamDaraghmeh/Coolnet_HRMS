const { NotFoundError } = require("../../../utils/errors");

class GetBranchUseCase {
  constructor(branchRepository) {
    this.branchRepository = branchRepository;
  }

  async execute(branchId) {
    const branch = await this.branchRepository.findById(branchId);

    if (!branch) {
      throw new NotFoundError("Branch not found");
    }

    return {
      success: true,
      data: branch,
    };
  }
}

module.exports = GetBranchUseCase;
