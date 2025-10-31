
import Link from 'next/link';
import Image from 'next/image';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import WriteButton from './WriteButton'; // Import the new component

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
  
  if (!fs.existsSync(postsDirectory)) {
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
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500">개발 블로그</h1>
          <WriteButton />
        </div>
        
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link href={`/blog/${post.slug}`} key={post.slug}>
                <div className="group bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-300 transform hover:-translate-y-2 h-full flex flex-col">
                  <div className="relative w-full h-56">
                    <Image
                      src={post.frontmatter.thumbnail || '/images/blog/placeholder.svg'}
                      alt={post.frontmatter.title}
                      layout="fill"
                      objectFit="cover"
                      className="transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-all duration-300"></div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <h2 className="text-2xl font-bold mb-3 text-gray-100 group-hover:text-blue-400 transition-colors duration-300">{post.frontmatter.title}</h2>
                    <p className="text-gray-400 text-sm flex-grow">{post.frontmatter.date}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-500">아직 게시물이 없습니다.</p>
            <p className="mt-4 text-gray-400">첫 번째 게시물을 작성해주세요.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPage;
