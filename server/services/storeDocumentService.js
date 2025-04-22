
export async function storeDocument(req) {

    try {
        // Init Supabase client
        const supabase=  creaateCli

    } catch (error) {
        console.error(error);

        return {
            ok:false
        }
    }

    return {
        ok: true
    }
}