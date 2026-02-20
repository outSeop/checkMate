export type ActionResult<T = undefined> =
    | ({ success: true } & (T extends undefined ? {} : { data: T }))
    | { success: false; message: string }
