import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function GET(request) {
  try {
    // Get the authorization header from the request
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: 'Authorization header is missing' },
        { status: 401 }
      );
    }
    
    // Get the API URL from environment variable
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.vishvaopticalcompany.com';
    const endpoint = `${apiUrl}/api/reports/dashboard`;
    
    console.log(`Forwarding request to: ${endpoint}`);
    
    // Make request to the backend API
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
    });
    
    // Get the response data
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('API Error:', responseData);
      return NextResponse.json(
        { success: false, message: responseData.message || 'Failed to fetch dashboard data' },
        { status: response.status }
      );
    }
    
    return NextResponse.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 