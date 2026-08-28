import {
    SUPABASE_URL,
    SUPABASE_KEY
} from "./config.js";


/* =========================================================
   SUPABASE REQUEST
========================================================= */

async function supabaseFetch(
    endpoint,
    options = {}
) {

    const response = await fetch(
        `${SUPABASE_URL}${endpoint}`,
        {
            ...options,

            headers: {
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Content-Type": "application/json",
                ...(options.headers || {})
            }
        }
    );


    if (!response.ok) {

        const errorText =
            await response.text();

        throw new Error(
            `Supabase error ${response.status}: ${errorText}`
        );

    }


    return response;

}


/* =========================================================
   PRODUCTS
========================================================= */

export async function fetchProducts() {

    const response =
        await supabaseFetch(
            "/rest/v1/products" +
            "?select=*" +
            "&status=neq.hidden" +
            "&order=sort_order.asc,created_at.desc"
        );


    return response.json();

}
