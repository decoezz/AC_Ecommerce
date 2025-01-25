const mongoose = require('mongoose');

class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.totalCount = 0;
  }

  // Method to filter query parameters
  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];

    excludedFields.forEach((el) => delete queryObj[el]);

    // Convert operators (gte, gt, lte, lt) to MongoDB format
    Object.keys(queryObj).forEach((key) => {
      if (queryObj[key] instanceof Object) {
        Object.entries(queryObj[key]).forEach(([operator, value]) => {
          if (['gte', 'gt', 'lte', 'lt'].includes(operator)) {
            queryObj[key][`$${operator}`] = value;
            delete queryObj[key][operator];
          }
        });
      }
    });

    this.query = this.query.find(queryObj);
    return this;
  }

  // Method to sort query results
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt'); // Default: Sort by newest
    }
    return this;
  }

  // Method to limit fields returned in query results
  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // Method to paginate query results
  async paginate() {
    const page = Math.max(1, parseInt(this.queryString.page, 10) || 1);
    const limit = Math.max(1, parseInt(this.queryString.limit, 10) || 10);
    const skip = (page - 1) * limit;

    // Count total documents (for returning total pages)
    this.totalCount = await this.query.model.countDocuments();

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = APIFeatures;
