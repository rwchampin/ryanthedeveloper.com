 

import { createClient } from "@/lib/utils/supabase/server";
import { ProductsTable } from "./ProductsTable";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const Page = async () => {
    const supabase = createClient()
    const products = await supabase.from('products').select('*') || [];
    console.log(products);
    return (
        <div className="mt-3 grid h-full w-full grid-cols-7 gap-[20px] rounded-[20px]">
            <Button asChild>
                <Link href="/admin/ecommerce/products/create">
                    Add Product
                </Link>
            </Button>
            <div className="z-0 col-span-7 lg:col-span-7">
                <ProductsTable products={products} />
            </div>
        </div>
    );      

}
export default Page;