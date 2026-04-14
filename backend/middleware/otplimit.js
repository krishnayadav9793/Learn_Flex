import { sql } from "../util/neonConnect.js";

export async function otpRateLimit(req, res, next) {
    const { email } = req.body;
    if (!email) return res.status(400).json({ msg: "Email is required" });
    try{
        await sql`
            DELETE FROM "OTPRateLimit"
            WHERE email = ${email}
            AND requested_at < NOW() - INTERVAL '1 hour'
        `;
        const result = await sql`
            SELECT COUNT(*) as count
            FROM "OTPRateLimit"
            WHERE email = ${email}
            AND requested_at >= NOW() - INTERVAL '1 hour'
        `;

        const attemptCount = parseInt(result[0].count);

        if(attemptCount >= 3){
            const oldest = await sql`
                SELECT requested_at
                FROM "OTPRateLimit"
                WHERE email = ${email}
                AND requested_at >= NOW() - INTERVAL '1 hour'
                ORDER BY requested_at ASC
                LIMIT 1
            `;

            const oldestTime = new Date(oldest[0].requested_at);
            const retryAfter = new Date(oldestTime.getTime() + 60 * 60 * 1000);
            const minutesLeft = Math.ceil((retryAfter - Date.now()) / 60000);

            return res.status(429).json({
                msg: `OTP limit reached. Try again in ${minutesLeft} minute(s).`,
                retryAfter: retryAfter.toISOString(),
            });
        }
        await sql`
            INSERT INTO "OTPRateLimit" (email, requested_at)
            VALUES (${email}, NOW())
        `;

        next();
    } catch (e) {
        console.error("OTP rate limit error:", e);
        return res.status(500).json({ msg: "Internal server error" });
    }
}