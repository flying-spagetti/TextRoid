"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Page() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch('https://api.vercel.app/blog');
                if (!response.ok) {
                    throw new Error('Failed to load posts');
                }
                const data = await response.json();
                setPosts(data);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <p>Loading...</p>;
    }

    if (posts.length === 0) {
        return <p>No posts found</p>
    }

    return (
      <>
        <ul>
            {posts.map((post: any) => (
                <li key={post.id}>{post.title}</li>
            ))}
        </ul>
        
        </>
    );
}