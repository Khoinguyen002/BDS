import type { PayloadHandler } from 'payload'
import { headersWithCors } from '@payloadcms/next/utilities'
import { generateUniqueSlug } from '../utils/slug'

export const registerHandler: PayloadHandler = async (req) => {
  const { payload } = req

  // v3: body không tự gắn vào req — phải tự đọc
  const body = await req.json?.()
  const email = body?.email
  const password = body?.password

  if (!email || !password) {
    return Response.json(
      { error: 'Email và password là bắt buộc' },
      { status: 400, headers: headersWithCors({ headers: new Headers(), req }) },
    )
  }

  // Bắt đầu transaction. Postgres trả ID; có thể là null nếu transaction bị disable.
  const transactionID = await payload.db.beginTransaction()

  // Nếu adapter không cho transaction (null) thì vẫn chạy được, chỉ là không atomic.
  // Với Postgres bình thường sẽ luôn có ID.
  if (transactionID) req.transactionID = transactionID

  try {
    // 1. Tạo user — truyền NGUYÊN req để kế thừa transactionID
    const user = await payload.create({
      collection: 'users',
      data: { email, password, role: 'agent' },
      req,
    })

    // 2. Sinh slug (truyền req để query slug trùng cũng nằm trong transaction)
    const slug = await generateUniqueSlug(email.split('@')[0], req)

    // 3. Tạo landing page — cùng req, cùng transaction
    await payload.create({
      collection: 'landing-pages',
      data: {
        owner: user.id,
        slug,
        blocks: [
          { blockType: 'heroBanner', title: `Trang của ${email}` },
        ],
      },
      req,
    })

    // 4. Commit — chỉ khi thực sự có transaction
    if (transactionID) await payload.db.commitTransaction(transactionID)

    return Response.json(
      { user: { id: user.id, email: user.email } },
      { status: 201, headers: headersWithCors({ headers: new Headers(), req }) },
    )
  } catch (error) {
    // Rollback cả user lẫn landing page
    if (transactionID) await payload.db.rollbackTransaction(transactionID)

    payload.logger.error({ msg: 'Đăng ký thất bại, đã rollback', err: error })

    return Response.json(
      { error: error instanceof Error ? error.message : 'Đăng ký thất bại' },
      { status: 500, headers: headersWithCors({ headers: new Headers(), req }) },
    )
  }
}
