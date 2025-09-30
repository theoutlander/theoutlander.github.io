import { useState, useEffect } from "react";
import { FaComment, FaHeart, FaPaperPlane } from "react-icons/fa";
import { css } from "../../styled-system/css";
import {
	commentsSection,
	commentsContainer,
	commentsHeader,
	commentsTitle,
	commentsContent,
	commentsActions,
} from "../../styled-system/recipes";

interface Comment {
	id: string;
	name: string;
	content: string;
	date: string;
}

interface SimpleCommentsProps {
	postSlug?: string;
}

export default function SimpleComments({
	postSlug = "default",
}: SimpleCommentsProps) {
	const [comments, setComments] = useState<Comment[]>([]);
	const [showForm, setShowForm] = useState(false);
	const [formData, setFormData] = useState({
		name: "",
		content: "",
	});
	const [error, setError] = useState<string | null>(null);

	// Load comments from localStorage on component mount
	useEffect(() => {
		const storageKey = `simple-comments-${postSlug}`;
		const savedComments = localStorage.getItem(storageKey);
		if (savedComments) {
			try {
				setComments(JSON.parse(savedComments));
			} catch (err) {
				console.error("Failed to parse saved comments:", err);
			}
		}
	}, [postSlug]);

	// Save comments to localStorage whenever comments change
	useEffect(() => {
		if (comments.length > 0) {
			const storageKey = `simple-comments-${postSlug}`;
			localStorage.setItem(storageKey, JSON.stringify(comments));
		}
	}, [comments, postSlug]);

	const handleSubmitComment = (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.name || !formData.content) {
			setError("Please fill in all fields");
			return;
		}

		const newComment: Comment = {
			id: Date.now().toString(),
			name: formData.name,
			content: formData.content,
			date: new Date().toISOString(),
		};

		setComments((prev) => [newComment, ...prev]);
		setFormData({ name: "", content: "" });
		setShowForm(false);
		setError(null);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	return (
		<div className={commentsSection()}>
			<hr
				className={css({
					border: "none",
					borderTop: "1px solid #e2e8f0",
					mb: "32px",
				})}
			/>

			<div className={commentsContainer()}>
				<div className={commentsHeader()}>
					<div
						className={css({
							display: "flex",
							gap: "12px",
							alignItems: "center",
							justifyContent: "space-between",
							flexWrap: "wrap",
						})}
					>
						<div className={commentsTitle()}>
							<FaComment
								size={20}
								color="#3182ce"
							/>
							<h2
								style={{
									fontSize: "1.5rem",
									fontWeight: "600",
									color: "#1a202c",
									margin: 0,
								}}
							>
								Comments
							</h2>
							<span
								style={{
									backgroundColor: "#ebf8ff",
									color: "#3182ce",
									padding: "4px 8px",
									borderRadius: "4px",
									fontSize: "12px",
									fontWeight: "500",
								}}
							>
								{comments.length}{" "}
								{comments.length === 1 ? "Comment" : "Comments"}
							</span>
						</div>
						<FaHeart
							size={16}
							color="#fc8181"
						/>
					</div>

					<p
						style={{
							color: "#718096",
							fontSize: "16px",
							lineHeight: "1.6",
							margin: 0,
						}}
					>
						Share your thoughts and join the discussion! Leave a comment below.
					</p>

					{error && (
						<div
							style={{
								padding: "12px 16px",
								backgroundColor: "#fed7d7",
								color: "#c53030",
								borderRadius: "6px",
								border: "1px solid #feb2b2",
								fontSize: "14px",
							}}
						>
							{error}
						</div>
					)}

					{!showForm && (
						<button
							style={{
								padding: "8px 16px",
								backgroundColor: "#3182ce",
								color: "white",
								border: "none",
								borderRadius: "6px",
								fontSize: "14px",
								cursor: "pointer",
								display: "flex",
								alignItems: "center",
								gap: "8px",
								alignSelf: "flex-start",
							}}
							onClick={() => setShowForm(true)}
						>
							<FaComment size={14} />
							Add a Comment
						</button>
					)}

					{showForm && (
						<div
							style={{
								padding: "24px",
								backgroundColor: "#f7fafc",
								borderRadius: "12px",
								border: "1px solid #e2e8f0",
							}}
						>
							<form onSubmit={handleSubmitComment}>
								<div
									style={{
										display: "flex",
										flexDirection: "column",
										gap: "16px",
									}}
								>
									<div>
										<label
											style={{
												display: "block",
												fontSize: "14px",
												fontWeight: "500",
												marginBottom: "4px",
												color: "#1a202c",
											}}
										>
											Name *
										</label>
										<input
											type="text"
											value={formData.name}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													name: e.target.value,
												}))
											}
											placeholder="Your name"
											style={{
												width: "100%",
												padding: "8px 12px",
												border: "1px solid #e2e8f0",
												borderRadius: "6px",
												fontSize: "14px",
											}}
										/>
									</div>
									<div>
										<label
											style={{
												display: "block",
												fontSize: "14px",
												fontWeight: "500",
												marginBottom: "4px",
												color: "#1a202c",
											}}
										>
											Comment *
										</label>
										<textarea
											value={formData.content}
											onChange={(e) =>
												setFormData((prev) => ({
													...prev,
													content: e.target.value,
												}))
											}
											placeholder="Write your comment here..."
											rows={4}
											style={{
												width: "100%",
												padding: "8px 12px",
												border: "1px solid #e2e8f0",
												borderRadius: "6px",
												fontSize: "14px",
												resize: "vertical",
											}}
										/>
									</div>
									<div style={{ display: "flex", gap: "12px" }}>
										<button
											type="submit"
											style={{
												padding: "8px 16px",
												backgroundColor: "#3182ce",
												color: "white",
												border: "none",
												borderRadius: "6px",
												fontSize: "14px",
												cursor: "pointer",
												display: "flex",
												alignItems: "center",
												gap: "8px",
											}}
										>
											<FaPaperPlane size={14} />
											Post Comment
										</button>
										<button
											type="button"
											style={{
												padding: "8px 16px",
												backgroundColor: "white",
												color: "#1a202c",
												border: "1px solid #e2e8f0",
												borderRadius: "6px",
												fontSize: "14px",
												cursor: "pointer",
											}}
											onClick={() => setShowForm(false)}
										>
											Cancel
										</button>
									</div>
								</div>
							</form>
						</div>
					)}

					<div
						style={{
							minHeight: "200px",
							borderRadius: "12px",
							overflow: "hidden",
							border: "1px solid #e2e8f0",
							boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
							backgroundColor: "white",
						}}
					>
						{comments.length === 0 ? (
							<div
								style={{
									padding: "32px",
									textAlign: "center",
								}}
							>
								<FaComment
									size={48}
									color="#cbd5e0"
								/>
								<p
									style={{
										marginTop: "16px",
										color: "#718096",
										margin: "16px 0 0 0",
									}}
								>
									No comments yet. Be the first to comment!
								</p>
							</div>
						) : (
							<div style={{ display: "flex", flexDirection: "column" }}>
								{comments.map((comment) => (
									<div
										key={comment.id}
										style={{
											padding: "24px",
											borderBottom: "1px solid #f1f5f9",
										}}
									>
										<div
											style={{
												display: "flex",
												flexDirection: "column",
												gap: "12px",
											}}
										>
											<div
												style={{
													display: "flex",
													gap: "12px",
													alignItems: "flex-start",
												}}
											>
												<div
													style={{
														display: "flex",
														flexDirection: "column",
														gap: "4px",
														flex: 1,
													}}
												>
													<p
														style={{
															fontWeight: "500",
															fontSize: "14px",
															margin: 0,
															color: "#1a202c",
														}}
													>
														{comment.name}
													</p>
													<p
														style={{
															color: "#a0aec0",
															fontSize: "12px",
															margin: 0,
														}}
													>
														{formatDate(comment.date)}
													</p>
												</div>
											</div>
											<p
												style={{
													color: "#1a202c",
													lineHeight: "1.6",
													whiteSpace: "pre-wrap",
													margin: 0,
												}}
											>
												{comment.content}
											</p>
										</div>
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
