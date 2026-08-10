export interface Model {
  id: number;
  name: string;
  /** The API returns the make id as `make`, not `make_id` */
  make: number;
  make_id?: number;
  make_name: string;
}
