class HttpStatusCodes {
  static OK(data, message = "OK") {
    return { code: 200, status: "OK", message, data };
  }

  static SEE_OTHER(url, message = "Please follow the URL provided") {
    return { code: 303, status: "SEE_OTHER", message, url };
  }

  static INVALID_ARGUMENT(message = "Client specified an invalid argument") {
    return { code: 400, status: "INVALID_ARGUMENT", message };
  }

  static UNAUTHENTICATED(message = "Request is not authenticated") {
    return { code: 401, status: "UNAUTHENTICATED", message };
  }

  static PERMISSION_DENIED(message = "Permission denied") {
    return { code: 403, status: "PERMISSION_DENIED", message };
  }

  static NOT_FOUND(message = "Resource not found") {
    return { code: 404, status: "NOT_FOUND", message };
  }

  static ALREADY_EXISTS(message = "Resource already exists") {
    return { code: 409, status: "ALREADY_EXISTS", message };
  }

  static RESOURCE_EXHAUSTED(message = "Out of resource") {
    return { code: 429, status: "RESOURCE_EXHAUSTED", message };
  }

  static CANCELLED(message = "Request cancelled by the client") {
    return { code: 499, status: "CANCELLED", message };
  }

  static UNKNOWN(message = "Unknown Server Error") {
    return { code: 500, status: "UNKNOWN", message };
  }

  static NOT_IMPLEMENTED(message = "API method is not implemented") {
    return { code: 501, status: "NOT_IMPLEMENTED", message };
  }

  static UNAVAILABLE(message = "Service unavailable") {
    return { code: 503, status: "UNAVAILABLE", message };
  }

  static DEADLINE_EXCEEDED(message = "Request deadline exceeded") {
    return { code: 504, status: "DEADLINE_EXCEEDED", message };
  }
}

export default HttpStatusCodes;
