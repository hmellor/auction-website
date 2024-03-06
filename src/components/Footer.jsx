import { FaGithub } from "react-icons/fa";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="container d-flex flex-wrap justify-content-between align-items-center py-3 my-4 border-top">
      <div className="col-md-4 d-flex align-items-center">
        <span className="text-muted">© {year} Harry Mellor</span>
      </div>
      <ul className="nav col-md-4 justify-content-end list-unstyled d-flex">
        <li className="ms-3">
          <a
            className="bi bi-github text-muted"
            href="https://github.com/HMellor/"
            width="24"
            height="24"
          >
            <FaGithub />
          </a>
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
