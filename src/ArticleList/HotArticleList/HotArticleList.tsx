import "../ArticleList.scss";

import sidemenu from "../../assets/sidemenu.svg";
import React, { useEffect, useState, useContext } from "react";
import SideBar from "../../SideBar/SideBar";
import { Link, useNavigate } from "react-router-dom";
import everyOURLogo from "../../assets/logo.svg";
import { query, collection, where, getDocs } from "firebase/firestore";
import { db } from "../../firebase";
import { AuthContext } from "../../AuthContext";

function ArticleList(): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [articles, setArticles] = useState<any[]>([]);
  const [filteredArticles, setFilteredArticles] = useState([]); // 필터링된 게시글을 저장할 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [showSearchInput, setShowSearchInput] = useState(false);

  const handleSearch = (event) => {
    event.preventDefault();
    if (searchTerm) {
      const filtered = articles.filter(
        (article) =>
          article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
          article.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
    } else {
      setFilteredArticles(articles);
    }
  };

  useEffect(() => {
    setFilteredArticles(articles);
  }, [articles]);

  const toggleSide = () => {
    setIsOpen(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      const q = query(
        collection(db, "posts"),
        where("category", "==", "Hot 게시판")
      );

      try {
        const querySnapshot = await getDocs(q);
        const fetchedArticles = querySnapshot.docs.map((doc) => {
          const createAtTimestamp = doc.data().createAt;
          const date = new Date(createAtTimestamp.seconds * 1000);
          const formattedDate = date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          });
          return {
            id: doc.id,
            ...doc.data(),
            formattedDate: formattedDate,
          };
        });
        fetchedArticles.sort((a, b) => {
          // Timestamp 비교하여 정렬, 최신 데이터가 앞에 오도록 설정
          if (a.createAt.seconds === b.createAt.seconds) {
            return b.createAt.nanoseconds - a.createAt.nanoseconds;
          }
          return b.createAt.seconds - a.createAt.seconds;
        });
        setArticles(fetchedArticles);
      } catch (error) {
        console.error("Error fetching documents: ", error);
      }
    };

    fetchData();
  }, []);

  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleWriteButtonClick = () => {
    if (!currentUser) {
      alert("구글 로그인이 필요합니다.");
    } else {
      navigate("/writepage");
    }
  };

  return (
    <div className="articleList">
      <Link to={"/"}>
        <img
          src={everyOURLogo}
          alt="everyOUR 메인 로고"
          className="smallLogo"
        />
      </Link>
      <div className="listBox">
        <div className="boardName">Hot 게시판</div>
        <div className="ggArea">경기 남부</div>
        <div className="sideMenuBtn" onClick={toggleSide}>
          <img src={sidemenu} alt="사이드 메뉴 버튼" className="sideMenuBtn" />
        </div>
        <SideBar isOpen={isOpen} setIsOpen={setIsOpen} />
        <button
          onClick={() => setShowSearchInput((prev) => !prev)}
          className="articleSearch"
        >
          검색
        </button>
        {showSearchInput && (
          <form onSubmit={handleSearch} className="searchForm">
            <input
              type="text"
              placeholder="검색어 입력"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="searchBar"
            />
            <input type="submit" value="검색" className="searchBtn" />
          </form>
        )}
        <button className="writeBtn" onClick={handleWriteButtonClick}>
          글쓰기
        </button>
        <div className="boardArticleList">
          {filteredArticles.length > 0 ? (
            <ul className="boardArticleList__ul">
              {filteredArticles.map((article) => (
                <li key={article.id} className="boardArticleList__ul__li">
                  <Link to={`/postIn/${article.id}`}>
                    <span className="boardArticleList__ul__li__title">
                      {article.title}
                    </span>
                    <span className="boardArticleList__ul__li__comment">
                      댓글 {article.comCnt}
                    </span>
                    <span className="boardArticleList__ul__li__like">
                      좋아요 {article.likeCnt}
                    </span>
                    <span className="boardArticleList__ul__li__nickname">
                      {article.author}
                    </span>
                    <span className="boardArticleList__ul__li__date">
                      {article.formattedDate}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="no-results">검색 결과가 없습니다.</div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ArticleList;
