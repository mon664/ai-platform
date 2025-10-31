
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

// Define the structure of a post
interface Post {
  slug: string;
  frontmatter: {
    [key: string]: any;
  };
}

// This function will run at build time on the server
const getPosts = (): Post[] => {
  const postsDirectory = path.join(process.cwd(), '_posts');
  
  // Check if the directory exists. If not, return an empty array.
  if (!fs.existsSync(postsDirectory)) {
    console.log("'_posts' directory not found. Returning empty array.");
    return [];
  }

  const fileNames = fs.readdirSync(postsDirectory);
  const posts = fileNames.map((fileName) => {
    const slug = fileName.replace('.md', '');
    const filePath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data: frontmatter } = matter(fileContents);

    return {
      slug,
      frontmatter,
    };
  });

  // Sort posts by date in descending order
  return posts.sort((a, b) => new Date(b.frontmatter.date).getTime() - new Date(a.frontmatter.date).getTime());
};

const BlogPage = () => {
  const posts = getPosts();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">블로그</h1>
      
      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <Link href={`/blog/${post.slug}`} key={post.slug}>
              <div className="block p-6 border border-gray-200 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-700 cursor-pointer">
                <h2 className="text-2xl font-bold mb-2">{post.frontmatter.title}</h2>
                <p className="text-gray-500">{post.frontmatter.date}</p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-xl text-gray-500">아직 게시물이 없습니다.</p>
          <p className="mt-2 text-gray-400">관리자 페이지에서 첫 번째 게시물을 작성해보세요.</p>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
