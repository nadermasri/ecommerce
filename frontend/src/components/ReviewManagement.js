//authentic_lebanese_sentiment_shop/frontend/src/components/ReviewManagement.js

// src/components/ReviewManagement.js

import React, { useEffect, useState } from 'react';
import { getReviews } from '../services/reviewService';
import { Table, TableBody, TableCell, TableHead, TableRow, Button } from '@mui/material';

function ReviewManagement() {
    const [reviews, setReviews] = useState([]);

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = async () => {
        const data = await getReviews();
        setReviews(data);
    };

    return (
        <div>
            <h2>Manage Reviews</h2>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>Product ID</TableCell>
                        <TableCell>User ID</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Comment</TableCell>
                        <TableCell>Actions</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {reviews.map((review) => (
                        <TableRow key={review.id}>
                            <TableCell>{review.id}</TableCell>
                            <TableCell>{review.product_id}</TableCell>
                            <TableCell>{review.user_id}</TableCell>
                            <TableCell>{review.rating}</TableCell>
                            <TableCell>{review.comment}</TableCell>
                            <TableCell>
                                <Button variant="contained" color="secondary">Delete</Button>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default ReviewManagement;
