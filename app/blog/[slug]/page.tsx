
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { marked } from 'marked'; // Using 'marked' for server-side rendering of markdown

// This function generates the paths for each post
export const generateStaticParams = async () => {
  const postsDirectory = path.join(process.cwd(), '_posts');
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }
  const files = fs.readdirSync(postsDirectory);
  return files.map((filename) => ({
    slug: filename.replace('.md', ''),
  }));
};

// This function fetches the data for a single post
const getPost = (slug: string) => {
  const postsDirectory = path.join(process.cwd(), '_posts');
  const filePath = path.join(postsDirectory, `${slug}.md`);
  
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data: frontmatter, content } = matter(fileContents);
  
  const htmlContent = marked(content);

  return {
    frontmatter,
    content: htmlContent,
  };
};

const PostPage = ({ params }: { params: { slug: string } }) => {
  const post = getPost(params.slug);

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-4xl font-bold">404 - 페이지를 찾을 수 없습니다.</h1>
        <p className="mt-4">요청하신 게시물을 찾을 수 없습니다.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose lg:prose-xl dark:prose-invert mx-auto">
        <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{post.frontmatter.title}</h1>
            <p className="text-gray-500">{post.frontmatter.date}</p>
        </div>
        <div dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
};

export default PostPage;
