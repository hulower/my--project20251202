// server/src/utils/response.js
/**
 * ============================================
 * 统一响应格式工具
 * ============================================
 * 
 * 提供标准的 API 响应格式，确保前后端接口规范统一
 */

/**
 * 成功响应
 * @param {Object} res - Express response 对象
 * @param {*} data - 返回的数据
 * @param {string} message - 提示信息
 * @param {number} code - 业务状态码（默认 200）
 */
function success(res, data = null, message = '操作成功', code = 200) {
  res.status(200).json({
    code,
    success: true,
    message,
    data,
    timestamp: Date.now()
  });
}

/**
 * 失败响应
 * @param {Object} res - Express response 对象
 * @param {string} message - 错误信息
 * @param {number} code - 业务状态码
 * @param {number} httpStatus - HTTP 状态码
 */
function error(res, message = '操作失败', code = 500, httpStatus = 500) {
  res.status(httpStatus).json({
    code,
    success: false,
    message,
    data: null,
    timestamp: Date.now()
  });
}

/**
 * 分页响应
 * @param {Object} res - Express response 对象
 * @param {Array} list - 数据列表
 * @param {number} total - 总数
 * @param {number} page - 当前页
 * @param {number} pageSize - 每页数量
 * @param {string} message - 提示信息
 */
function paginated(res, list, total, page, pageSize, message = '查询成功') {
  res.status(200).json({
    code: 200,
    success: true,
    message,
    data: {
      list,
      pagination: {
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize)
      }
    },
    timestamp: Date.now()
  });
}

/**
 * 常用业务状态码
 */
const CODE = {
  SUCCESS: 200,           // 成功
  CREATED: 201,           // 创建成功
  BAD_REQUEST: 400,       // 请求参数错误
  UNAUTHORIZED: 401,      // 未授权
  FORBIDDEN: 403,         // 禁止访问
  NOT_FOUND: 404,         // 资源不存在
  CONFLICT: 409,          // 资源冲突
  INTERNAL_ERROR: 500,    // 服务器错误
};

module.exports = {
  success,
  error,
  paginated,
  CODE
};
