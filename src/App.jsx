import { createContext, useContext, useEffect, useState, useRef } from 'react';
import './App.css';
import liked from './assets/like.svg';
import more from './assets/more.svg';

const RouterContext = createContext(null);
const CommentsContext = createContext({ comments: [], setComments: () => { }, postId: null, setPostId: () => { } });

const routes = [
  {
    id: crypto.randomUUID(),
    name: 'Home',
    url: '#/',
    element: <Home />,
  },
  {
    id: crypto.randomUUID(),
    name: 'About',
    url: '#/about',
    element: <About />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Blog',
    url: '#/blog',
    element: <Blog />,
  },
  {
    id: crypto.randomUUID(),
    name: 'Contact',
    url: '#/contact',
    element: <Contact />,
  },
];

const notFound = {
  name: 'Page not found',
  element: <NotFound />,
};

function getRoute(routeUrl) {
  const route = routes.find((x) => x.url === routeUrl);
  return route ?? notFound;
}

const title = 'App';

function setTitle(pageTitle) {
  document.title = `${pageTitle} - ${title}`;
}

function App() {
  const [route, setRoute] = useState(() => {
    if (location.hash.length < 2) {
      return routes[0];
    }
    return getRoute(location.hash);
  });

  const [comments, setComments] = useState([]);
  const [postId, setPostId] = useState(null);

  useEffect(() => {
    setTitle(route.name);
  }, [route]);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRoute(location.hash));
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    const storedPostId = localStorage.getItem('postId');
    const storedComments = localStorage.getItem('comments');

    if (storedPostId) {
      setPostId(storedPostId);
    }

    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }
  }, []);

  useEffect(() => {
    if (comments.length > 0) {
      localStorage.setItem('comments', JSON.stringify(comments));
    }
  }, [comments]);

  useEffect(() => {
    if (postId !== null) {
      localStorage.setItem('postId', postId);
    }
  }, [postId]);

  return (
    <div className="container">
      <RouterContext.Provider value={route}>
        <CommentsContext.Provider value={{ comments, setComments, postId, setPostId }}>
          <Header />
          <Main />
          <Footer />
        </CommentsContext.Provider>
      </RouterContext.Provider>
    </div>
  );
}

function Main() {
  return (
    <div className="main">
      <Content />
      <Sidebar />
    </div>
  );
}

function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="header">
      <a href="#/" className="logo">The Curious Corner</a>
      <button className="nav-toggle" onClick={toggleMenu}>
        ☰
      </button>
      <Nav isOpen={isOpen} />
    </div>
  );
}

function Nav({ isOpen }) {
  const route = useContext(RouterContext);

  return (
    <ul className={`nav ${isOpen ? 'open' : ''}`}>
      {routes.map((x) => (
        <li key={x.id}>
          <a href={x.url} className={route.url === x.url ? 'selected' : ''}>
            {x.name}
          </a>
        </li>
      ))}
    </ul>
  );
}


function Content() {
  const route = useContext(RouterContext);

  return (
    <div className="content">
      <h1>{route.name}</h1>
      {route.element}
    </div>
  );
}

function Footer() {
  return <div className="footer">&copy; 2024</div>;
}

function Sidebar() {
  const { comments, setComments, postId, setPostId } = useContext(CommentsContext);
  const route = useContext(RouterContext);

  const nameRef = useRef(null);
  const commentRef = useRef(null);

  const handleCommentSubmit = (e) => {
    e.preventDefault();

    const name = nameRef.current.value;
    const body = commentRef.current.value;

    if (name && body) {
      const newComment = {
        id: crypto.randomUUID(),
        user: { fullName: name },
        body: body,
      };

      const updatedComments = [...comments, newComment];
      setComments(updatedComments);

      localStorage.setItem('comments', JSON.stringify(updatedComments));

      nameRef.current.value = '';
      commentRef.current.value = '';
    }
  };

  return (
    <div className="sidebar">
      <div className="widget">
        <LikeBtn />
      </div>

      {route.name === 'Blog' && postId && (
        <div className="widget">
          <h4>Comments:</h4>
          {comments.length ? (
            comments.map((comment) => (
              <p key={comment.id}>
                <strong>{comment.user.fullName}</strong> says: {comment.body}
              </p>
            ))
          ) : (
            <p>No comments yet.</p>
          )}
          <div className="inputArea">
            <form onSubmit={handleCommentSubmit}>
              <input
                required
                type="text"
                name="name"
                placeholder="Your Name"
                ref={nameRef}
              />
              <input
                required
                type="text"
                name="addComment"
                placeholder="Comment"
                ref={commentRef}
              />
              <button type="submit">Share</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LikeBtn() {
  const [likeCount, setLikeCount] = useState(() => {
    const storedLikeCount = localStorage.getItem('likeCount');
    return storedLikeCount ? parseInt(storedLikeCount, 10) : 0;
  });

  useEffect(() => {
    localStorage.setItem('likeCount', likeCount);
  }, [likeCount]);

  function increaseLikeCount() {
    setLikeCount(likeCount + 1);
  }

  return (
    <button className="likeBtn" onClick={increaseLikeCount}>
      <img className='liked' src={liked} alt="" /> {likeCount}
    </button>
  );
}

function Home() {
  return (
    <div>
      <h2>Welcome to Our Blog!</h2>
      <p>
        Hey there! 👋 We're thrilled to have you here. This is not just another blog; it's a cozy little corner of the internet where we share thoughts, stories, and things that fascinate us. Grab a cup of coffee (or tea, no judgment here) and stay a while!
      </p>
      <p>
        Feel free to explore our content, whether you're into tech, lifestyle, or just here to see what all the fuss is about. Got questions or thoughts? Hit us up on the <a href="#/contact">Contact</a> page!
      </p>

    </div>
  );
}

function About() {
  return (
    <div>
      <h2>Who We Are</h2>
      <p>
        We're just a bunch of passionate individuals who believe in the magic of words, tech, and everything in between. Our goal? To make your time here worth every second. Whether we're talking about coding tips, life hacks, or deep dives into obscure topics—you're in for a treat.
      </p>
      <h3>Our Mission</h3>
      <p>
        Our mission is simple: to create a space where curiosity meets creativity. We're here to inspire, inform, and maybe even make you chuckle now and then.
      </p>
      <h3>Meet the Crew</h3>
      <ul>
        <li><strong>John Doe</strong> - CEO & Founder. The big boss, but also the one who brings in donuts every Friday. 🍩</li>
        <li><strong>Jane Smith</strong> - Lead Developer. The coding ninja. If it's broken, she’ll fix it. If it's not broken, she’ll make it better.</li>
        <li><strong>Emily Davis</strong> - UX/UI Designer. The one who makes everything look pretty and works like a charm.</li>
      </ul>
    </div>
  );
}

function Contact() {
  return (

    <div>
      <h2>Let's Get in Touch!</h2>
      <p>If you have any questions, ideas, or just want to chat, we’re all ears! Seriously, we’d love to hear from you.</p>

      <h3>Email Us</h3>
      <p>Email: contact@example.com (We promise to reply faster than a speeding bullet! 📨)</p>

      <h3>Visit Our Office</h3>
      <p>
        123 Web Street<br />
        San Francisco, CA 94102<br />
        USA (Just kidding, we’re everywhere and nowhere.)
      </p>

      <h3>Share Your Thoughts with Us</h3>
      <p>
        Got a blog post idea? Or maybe you've already written something that you think would be a perfect fit for our audience? We'd love to feature your voice on our blog! Submit your blog post idea or the full post below, and let's make something awesome together.
      </p>
      <form>
        <div>
          <label>Name:</label>
          <input type="text" id="name" name="name" required />
        </div>
        <div>
          <label>Email:</label>
          <input type="email" id="email" name="email" required />
        </div>
        <div>
          <label>Your Blog Post Idea:</label>
          <textarea id="postIdea" name="postIdea" placeholder="Tell us about your idea or share a part of your blog post..." required></textarea>
        </div>
        <button type="submit">Submit Your Idea</button>
      </form>
    </div>
  );
}

function Blog() {
  const { postId, setPostId } = useContext(CommentsContext);

  return (
    <>
      {postId ? (
        <PostDetail postId={postId} setPostId={setPostId} />
      ) : (
        <PostList setPostId={setPostId} />
      )}
    </>
  );
}

function PostList({ setPostId }) {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    fetch('https://dummyjson.com/posts')
      .then((r) => r.json())
      .then((r) => {
        setPosts(r.posts);
      });
  }, []);

  const handlePageChange = (direction) => {
    setPage((prevPage) => prevPage + direction);
  };

  const handlePageSizeChange = (e) => {
    setPageSize(Number(e.target.value));
    setPage(1);
  };

  const paginatedPosts = posts.slice((page - 1) * pageSize, page * pageSize);

  return (
    <>
      <div className="select-page-size">
        <label htmlFor="pageSize">Posts per page: </label>
        <select id="pageSize" value={pageSize} onChange={handlePageSizeChange}>
          <option value="6">6</option>
          <option value="10">10</option>
          <option value="24">24</option>

        </select>
      </div>

      <div className="post-grid">
        {paginatedPosts.map((x) => (
          <div key={x.id} className="post-item">
            <h3>{x.title}</h3>
            <button
              className="post-btn"
              onClick={(e) => {
                e.preventDefault();
                setPostId(x.id);
              }}
            >
              Read more... <img src={more} alt="" />
            </button>
          </div>
        ))}
      </div>

      <div className="pagination">
        <button
          onClick={() => handlePageChange(-1)}
          disabled={page === 1}
          className={page === 1 ? 'disabled' : ''}
        >
          Previous
        </button>
        <button
          onClick={() => handlePageChange(1)}
          disabled={page * pageSize >= posts.length}
          className={page * pageSize >= posts.length ? 'disabled' : ''}
        >
          Next
        </button>
      </div>
    </>
  );
}

function PostDetail({ postId, setPostId }) {
  const [post, setPost] = useState({});
  const { comments, setComments } = useContext(CommentsContext);

  useEffect(() => {
    async function getData() {
      const postData = await fetch(`https://dummyjson.com/posts/${postId}`).then((r) => r.json());
      const commentsData = await fetch(`https://dummyjson.com/posts/${postId}/comments`).then((r) => r.json());

      setPost(postData);
      setComments(commentsData.comments);
    }

    if (postId) {
      getData();
    }
  }, [postId, setComments]);

  function handleClick(e) {
    e.preventDefault();
    setPostId(null);
    setComments([]);
  }

  return (
    <>
      <div className="deneme">
        <div className="post-details">
          <p>
            <a href="#" onClick={handleClick} className="back-btn">
              &larr; Back to Blog
            </a>
          </p>
          <h3>{post.title}</h3>
          <p>{post.body}</p>
        </div>
      </div>
    </>
  );
}

function NotFound() {
  return (
    <p>
      Page not found. <a href="#/">return home</a>
    </p>
  );
}

export default App;
