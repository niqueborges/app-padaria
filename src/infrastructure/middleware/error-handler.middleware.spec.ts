import type { Request, Response, NextFunction } from 'express';
import { errorHandlerMiddleware } from './error-handler.middleware.js';
import { NotFoundError } from '../../domain/errors/app-error.js';

describe('Error Handler Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock });

    mockRequest = {
      headers: { 'x-request-id': 'test-uuid-123' },
    };

    mockResponse = {
      status: statusMock,
      json: jsonMock,
    };

    mockNext = jest.fn();
  });

  it('should handle AppError and return corresponding statusCode', () => {
    const error = new NotFoundError('Produto não encontrado');

    errorHandlerMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(404);
    expect(jsonMock).toHaveBeenCalledWith({
      error: 'Produto não encontrado',
      statusCode: 404,
      requestId: 'test-uuid-123',
    });
  });

  it('should handle generic unhandled Error and return statusCode 500', () => {
    const error = new Error('Falha de conexao');

    errorHandlerMiddleware(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(statusMock).toHaveBeenCalledWith(500);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: 500,
        requestId: 'test-uuid-123',
      })
    );
  });
});
