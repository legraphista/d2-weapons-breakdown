
export type UserTokens = {
  "access_token": string
  "token_type": "Bearer",
  "expires_in": number,
  // "refresh_token": string,
  // "refresh_expires_in": number
  "membership_id": string
}

export type UserTokensWithTimestamp = UserTokens & {
  created: number
}
