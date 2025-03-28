import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import PostLowerSection from "./PostLowerSection";
import { faEllipsis, faPlay } from "@fortawesome/free-solid-svg-icons";
import { AxiosError } from "axios";
import toast from "react-hot-toast";
import { useEffect, useRef, useState } from "react";
import { getLoadingPagePostData, likeAndDisLikePost, watchedPostAdd } from "@/apis/api/userApi";
import { IPostWithUserData } from "@/types/create-post/create-post";
import { Dot, Volume2, VolumeOff } from "lucide-react";
import { timeSince } from "@/helperFuntions/dateFormat";
import PostModal from "../common/PostViewModal/PostModal";
import { useNavigate } from "react-router-dom";
import VerificationIcon from "../common/svg/VerificationIcon";
import apiClient from "@/apis/apiClient";
import { Button } from "@/components/ui/button";
import VolumeUpIcon from "@mui/icons-material/VolumeUp";
import VolumeOffIcon from "@mui/icons-material/VolumeOff";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";

const Posts = () => {
  const [page, setPage] = useState(1);
  const [postData, setPostData] = useState<IPostWithUserData[]>([]);
  const [totalPage, setTotalPage] = useState(1);
  const navigate = useNavigate();
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const [muted, setMuted] = useState(true);
  const [play, setPlay] = useState(true);
  const [selectedPost, setSelectedPost] = useState<IPostWithUserData | null>(null);
  const loadingRef = useRef<HTMLDivElement | null>(null);
  const [music, setMusic] = useState<string>("");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<{ [key: string]: number }>({});

  const fetchPostData = async (page: number, status: boolean) => {
    try {
      const postData = await getLoadingPagePostData(page);
      if (status) {
        setPostData(postData.post);
        setTotalPage(postData.totalPage);
        setPage(1);
      } else {
        return postData
      }
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error(error.response.data?.error || "An error occurred");
        toast.error(error.response.data?.error || "An error occurred");
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  useEffect(() => {
    if (music && audioRef.current) {
      audioRef.current.src = music;
      if (isPlaying) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  }, [music, isPlaying]);

  const handleMusicPlay = async (musicId: string | null) => {
    if (!musicId) {
      if (audioRef.current) {
        audioRef.current.pause();
        setMusic("");
      }
      return;
    }

    try {
      const response = await apiClient.get(`/user/music/get-selected-music-data/${musicId}`);
      setMusic(response.data.music);
    } catch (error) {
      console.error("Error fetching music:", error);
    }
  };

  useEffect(() => {
    if (postData.length <= 0) {
      fetchPostData(page, true);
    }
  }, [page, postData.length]);

  const watchTimersRef = useRef(new Map<string, NodeJS.Timeout>());

  useEffect(() => {
    const watchTimers = watchTimersRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(async (entry) => {
          const index = postData.findIndex((post) => post.post[0].url === entry.target.getAttribute("src"));
          if (index === -1) return;
          const post = postData[index];
          const video = videoRefs.current[index];
          if (entry.isIntersecting) {
            if (post.post[0].type === "image" && post.musicId) {
              handleMusicPlay(post.musicId);
            } else {
              handleMusicPlay(null);
            }
            if (post.post[0].type === "video" || post.post[0].type === "reel") {
              setPlay(true);
              if (video) video.play();
  
              // Clear existing timer before setting a new one
              if (watchTimers.has(post._id)) {
                clearTimeout(watchTimers.get(post._id)!);
              }
  
              // Set new timer
              const timer = setTimeout(() => {
                markPostAsWatched(post._id);
                watchTimers.delete(post._id);
              }, 3000);
  
              watchTimers.set(post._id, timer);
            } else {
              markPostAsWatched(post._id);
            }
          } else {
            handleMusicPlay(null);
            if (video) video.pause();
            if (watchTimers.has(post._id)) {
              clearTimeout(watchTimers.get(post._id)!);
              watchTimers.delete(post._id);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    postData.forEach((post, index) => {
      const element = videoRefs.current[index] || document.querySelector(`img[src="${post.post[0].url}"]`);
      if (element) observer.observe(element);
    });

    return () => {
      observer.disconnect();
      watchTimers.forEach((timer) => clearTimeout(timer));
      watchTimers.clear();
    }
  }, [postData]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      async (entries) => {
        if (entries[0].isIntersecting && page < totalPage) {
          const newPosts = await fetchPostData(page + 1, false);
          if (newPosts.post && newPosts.post.length > 0) {
            setPostData((prevData) => [...prevData, ...newPosts.post]);
            setTotalPage(newPosts.totalPage);
            setPage(prev => prev + 1);
          }
        }
      },
      { threshold: 1.0 }
    );

    if (loadingRef.current) {
      observer.observe(loadingRef.current);
    }

    return () => observer.disconnect();
  }, [page, totalPage]);

  const handleMuteToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setMuted((prev) => !prev);
  };

  const markPostAsWatched = async (reelId: string) => {
    try {
      await watchedPostAdd(reelId);
    } catch (error) {
      if (error instanceof AxiosError && error.response) {
        console.error(error.response.data?.error || "An error occurred");
      } else {
        console.error("Unexpected error:", error);
        toast.error("An unexpected error occurred");
      }
    }
  };

  const handleNextImage = (postId: string, totalImages: number) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) + 1 < totalImages ? (prev[postId] ?? 0) + 1 : prev[postId],
    }));
  };

  const handlePreviousImage = (postId: string) => {
    setCurrentImageIndex((prev) => ({
      ...prev,
      [postId]: (prev[postId] ?? 0) > 0 ? (prev[postId] ?? 0) - 1 : 0,
    }));
  };


  const handleVideoClick = (index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
      setPlay(!play)
    }
  };

  const closeModal = (status: boolean = false) => {
    setSelectedPost(null);
    if (status) {
      navigate("/");
    } else {
      navigate(`/`);
    }
  };

  const closeWhileTouchOutsideModal = () => {
    setSelectedPost(null);
    navigate(`/`);
  }

  const handleSelectedPost = (item: IPostWithUserData, index: number) => {
    const video = videoRefs.current[index];
    if (video) {
      video.pause();
      setPlay(false);
    }
    setSelectedPost(item);
  }

  const handleAudioControl = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLikeAndUnlikePost = async (postId: string) => {

    const post = postData.find((p) => p._id.toString() === postId.toString());
    if (!post) return;

    const action = post.isLiked ? "dislike" : "like";
    await likeAndDisLikePost(postId, action);
    setPostData((prevPosts) =>
      prevPosts.map((p) =>
        p._id.toString() === postId.toString()
          ? { ...p, isLiked: !p.isLiked, likeCount: p.isLiked ? p.likeCount - 1 : p.likeCount + 1 }
          : p
      )
    );
  };

  return (
    <div className="w-full h-[80vh] scrollbar-hidden">
      <div className={`flex ${postData.length <= 0 && "h-full"} flex-col items-center justify-center gap-4 p-4`}>
        {
          postData.length > 0 ? (
            postData.map((item, index) => (
              <div key={item._id} className={`w-[40%] flex items-center flex-col justify-center rounded-xl-lg ${index !== 0 && "border-t"}`}>
                <div className="w-full">
                  {/* Post Header */}
                  <div className="px-1 py-3 rounded flex gap-3 items-center">
                    <div className="relative flex justify-between w-full items-center">
                      <div className="flex gap-3">
                        <div onClick={() => navigate(`/user/${item.userId.username}`)} className="w-10 h-10 rounded-full overflow-hidden cursor-pointer">
                          <img
                            src={item.userId.profilePicture.toString()}
                            alt="avatar"
                            className="object-cover w-full h-full"
                          />
                        </div>
                        <div className="flex items-center justify-center">
                          <div onClick={() => navigate(`/user/${item.userId.username}`)} className="flex cursor-pointer items-center gap-1">
                            <h2 className="font-bold text-medium">{item.userId.username}</h2>
                            {
                              item.userId.isVerified.status && (
                                <VerificationIcon size={'16'} />
                              )
                            }
                          </div>
                          <Dot />
                          <p className="text-gray-500 text-sm">{timeSince(item.createdAt)}</p>
                        </div>
                      </div>
                      <FontAwesomeIcon onClick={() => {
                        handleSelectedPost(item, index)
                        window.history.pushState(
                          null,
                          "",
                          `/post/${item._id}`
                        );
                      }} icon={faEllipsis} className="text-2xl cursor-pointer" />
                    </div>
                  </div>

                  {(selectedPost) && (
                    <PostModal
                      post={[selectedPost]}
                      imageIndex={0}
                      close={closeModal}
                      closeWhileTouchOutsideModal={closeWhileTouchOutsideModal}
                    />
                  )}

                  {/* Post Content */}
                  <div className="w-full border rounded-md">
                    {item.post[0].type === "video" || item.post[0].type === "reel" ? (
                      <div
                        onClick={() => handleVideoClick(index)}
                        className={`relative w-full ${item.post[0].type === "reel" ? "h-[540px]" : "h-full"} border rounded-md`}
                        style={{
                          filter: `
                            contrast(${item.post[0].customFilter.contrast}%)
                            brightness(${item.post[0].customFilter.brightness}%)
                            saturate(${item.post[0].customFilter.saturation}%)
                            sepia(${item.post[0].customFilter.sepia}%)
                            grayscale(${item.post[0].customFilter.grayScale}%)
                          `,
                        }}
                      >
                        <video
                          ref={(el) => (videoRefs.current[index] = el)}
                          muted={muted}
                          src={item.post[0].url}
                          className={`${item.post[0].filterClass} object-contain rounded-md w-full h-full`}
                          loop
                          playsInline
                        />
                        <button onClick={handleMuteToggle} className="absolute right-2 top-2 w-8 h-8 rounded-full flex items-center justify-center text-white bg-[#2c2c2c] bg-opacity-75 cursor-pointer z-10">
                          {
                            muted ? <VolumeOff size={20} strokeWidth={3} /> : <Volume2 size={20} strokeWidth={3} />
                          }
                        </button>
                        {
                          !play && (
                            <button
                              className="absolute inset-0 flex items-center justify-center"
                            >
                              <div className="w-20 h-20 text-3xl rounded-full flex items-center justify-center bg-[#000000] bg-opacity-30 cursor-pointer">
                                <FontAwesomeIcon className="hover:cursor-pointer" icon={faPlay} />
                              </div>
                            </button>
                          )
                        }
                      </div>
                    ) : (
                      <div
                        className="w-full h-full border-r rounded-md"
                        style={{
                          filter: `
                            contrast(${item.post[0].customFilter.contrast}%)
                            brightness(${item.post[0].customFilter.brightness}%)
                            saturate(${item.post[0].customFilter.saturation}%)
                            sepia(${item.post[0].customFilter.sepia}%)
                            grayscale(${item.post[0].customFilter.grayScale}%)
                          `,
                        }}
                      >
                        <img
                          src={item.post[currentImageIndex[item._id] ?? 0].url}
                          alt="Post"
                          className={`${item.post[0].filterClass} object-contain rounded-md w-full h-full`}
                        />
                        {
                          item.musicId && (
                            <Button
                              onClick={handleAudioControl}
                              variant="outline"
                              className="absolute bottom-2 border-none text-white z-10 hover:text-white right-2 w-8 h-8 rounded-full bg-black bg-opacity-50 hover:bg-black hover:bg-opacity-20 transition-colors flex items-center cursor-pointer justify-center"
                            >
                              {isPlaying ? (
                                <VolumeUpIcon style={{ fontSize: "15px" }} />
                              ) : (
                                <VolumeOffIcon style={{ fontSize: "15px" }} />
                              )}
                            </Button>
                          )
                        }

                        {item.post.length > 1 && (
                          <>
                            {(currentImageIndex[item._id] ?? 0) > 0 && (
                              <button
                                onClick={() => handlePreviousImage(item._id)}
                                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-[#d9cdc2] hover:bg-opacity-60 cursor-pointer transition-colors flex items-center justify-center"
                              >
                                <ChevronLeftIcon fontSize="medium" color="action" />
                              </button>
                            )}

                            {(currentImageIndex[item._id] ?? 0) < item.post.length - 1 && (
                              <button
                                onClick={() => handleNextImage(item._id, item.post.length)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-5 h-5 rounded-full bg-[#d9cdc2] hover:bg-opacity-60 cursor-pointer transition-colors flex items-center justify-center"
                              >
                                <ChevronRightIcon fontSize="medium" color="action" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <PostLowerSection postData={item} setSelectedPost={handleSelectedPost} index={index} handleLikeAndUnlikePost={handleLikeAndUnlikePost} />
                </div>
              </div>
            ))
          ) : (
            <div className="border p-3 rounded-lg flex flex-col items-center justify-center text-center space-y-4">
              <p className="text-lg">Looks like your feed is empty! Start exploring amazing content and connect with people.</p>
              <Button
                variant="outline"
                size={"lg"}
                onClick={() => navigate('/explore')}
              >
                Explore Now
              </Button>
            </div>

          )
        }
        <audio ref={audioRef} src={music} autoPlay={isPlaying}></audio>
        {page < totalPage && (
          <div ref={loadingRef} className="text-center my-4">
            <p className="spinner"></p>
          </div>
        )}
      </div>
    </div >
  );
};

export default Posts;
