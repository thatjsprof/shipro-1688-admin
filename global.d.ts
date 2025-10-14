type ApiResponse<D> = {
  data: D;
  status: number;
  message: string;
  error: any;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends object
    ? DeepPartial<T[P]>
    : T[P];
};

interface PaginatedResult<R> {
  data: R;
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
