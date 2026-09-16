import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!refreshToken || !clientId || !clientSecret) {
      return NextResponse.json({ error: 'Spotify refresh is not configured' }, { status: 400 });
    }

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams({ grant_type: 'refresh_token', refresh_token: refreshToken }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      },
    );

    return NextResponse.json(response.data);
  } catch (error) {
    const status = axios.isAxiosError(error) ? error.response?.status ?? 500 : 500;
    return NextResponse.json({ error: 'Unable to refresh Spotify session' }, { status });
  }
}
