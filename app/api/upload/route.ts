 import { NextResponse } from "next/server";

 const corsHeaders = {
   "Access-Control-Allow-Origin": "*", // change to "http://localhost:3000" for dev if needed
   "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
   "Access-Control-Allow-Headers": "Content-Type, Authorization",
 };

 // Handle OPTIONS preflight
 export async function OPTIONS() {
   return new NextResponse(null, {
     status: 204,
     headers: corsHeaders,
   });
 }

 export async function POST(request: Request) {
   try {
     const formData = await request.formData();
     const token = request.headers.get("Authorization");

     if (!token) {
       return NextResponse.json(
         { error: "Unauthorized" },
         { status: 401, headers: corsHeaders }
       );
     }

     const response = await fetch(
       "http://41.220.118.182:3000/price-reports/images",
       {
         method: "POST",
         headers: {
           Authorization: token,
         },
         body: formData,
       }
     );

     const data = await response.json();

     if (!response.ok) {
       return NextResponse.json(data, {
         status: response.status,
         headers: corsHeaders,
       });
     }

     return NextResponse.json(data, { headers: corsHeaders });
   } catch (error) {
     return NextResponse.json(
       { error: "Upload failed" },
       { status: 500, headers: corsHeaders }
     );
   }
 }
