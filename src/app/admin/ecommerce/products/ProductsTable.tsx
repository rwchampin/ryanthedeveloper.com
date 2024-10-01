import React from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
}

interface ProductsTableProps {
    products: Product[];
}

export const ProductsTable: React.FC<any> = ({ products }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Price</th>
                </tr>
            </thead>
            <tbody>
                {products.map((product) => (
                    <tr key={product.id}>
                        <td>{product.id}</td>
                        <td>{product.name}</td>
                        <td>{product.price}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

