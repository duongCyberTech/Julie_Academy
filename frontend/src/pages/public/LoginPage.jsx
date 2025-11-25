import React, { useState } from "react";
import {
    TextField,
    Button,
    Box,
    Container,
    Typography,
    Paper,
    CircularProgress,
    InputAdornment,
    IconButton,
    Fade,
    styled,
    useTheme,
    alpha,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { Email, Lock, Visibility, VisibilityOff } from "@mui/icons-material";
import AppSnackbar from '../../components/SnackBar'; 
import logobk from '../../assets/images/logobk.png';

const PageWrapper = styled(Box)(({ theme }) => ({
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: theme.palette.primary.dark,
    position: "relative",
    overflow: "hidden",
    "&::before": {
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Ccircle cx='30' cy='30' r='4'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
    },
}));

const FormPaper = styled(Paper)(({ theme }) => ({
    padding: theme.spacing(4),
    borderRadius: theme.shape.borderRadius * 1.5,
    backgroundColor: alpha(theme.palette.background.paper, 0.95),
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: theme.shadows[5],
}));

const StyledButton = styled(Button)(({ theme }) => ({
    padding: "12px 0",
    borderRadius: theme.shape.borderRadius,
    fontSize: "1.1rem",
    fontWeight: 600,
    textTransform: "none",
    color: theme.palette.primary.contrastText,
    background: theme.palette.primary.main,
    boxShadow: `0 4px 15px ${alpha(theme.palette.primary.main, 0.25)}`,
    "&:hover": {
        background: theme.palette.primary.dark,
        boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.35)}`,
    },
    "&:disabled": {
        background: alpha(theme.palette.primary.main, 0.5),
        color: alpha(theme.palette.primary.contrastText, 0.7),
    },
}));

const LoginPage = () => {
    const theme = useTheme();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const navigate = useNavigate();

    const handleLogin = async (event) => {
        event.preventDefault();
        setToast(prev => ({ ...prev, open: false }));
        
        if (!email || !password) {
             setToast({ open: true, message: "Vui lòng nhập đầy đủ email và mật khẩu", severity: 'warning' });
             return;
        }
        setLoading(true);
        try {
            const response = await axios.post("http://localhost:4000/auth/login", {
                email,
                password,
            });
            const token = response.data?.accessToken || response.data?.access_token;
            if (token) {
                localStorage.setItem("token", token);
                const decodedToken = jwtDecode(token);
                const userRole = decodedToken.role;
                const rolePath =
                    {
                        admin: "/admin/dashboard",
                        student: "/student/dashboard",
                        tutor: "/tutor/dashboard",
                        parent: "/parent/dashboard",
                    }[userRole] || "/";
                
                setToast({ 
                    open: true, 
                    message: `Đăng nhập thành công! Chào mừng ${userRole}.`, 
                    severity: 'success' 
                });

                setTimeout(() => {
                    navigate(rolePath);
                }, 1000);
                
            } else {
                 setToast({ open: true, message: "Không nhận được token xác thực từ server.", severity: 'error' });
            }
        } catch (err) {
            console.error("Lỗi đăng nhập:", err);
            const errorMessage = err.response?.status === 401
                ? "Email hoặc mật khẩu không đúng"
                : "Đã xảy ra lỗi. Vui lòng thử lại!";
            
            setToast({ 
                open: true, 
                message: errorMessage, 
                severity: 'error' 
            });
            
        } finally {
            setLoading(false);
        }
    };

    const handleCloseToast = (event, reason) => {
        if (reason === 'clickaway') return;
        setToast(prev => ({ ...prev, open: false }));
    };

    return (
        <PageWrapper>
            <Container maxWidth="sm">
                <Fade in={true} timeout={600}>
                    <FormPaper>
                        <Box sx={{ textAlign: "center", mb: 3 }}>
                            <Box
                                component="img"
                                src={logobk}
                                alt="Logo"
                                sx={{
                                    width: 120,
                                    height: "auto",
                                    mb: 2,
                                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))",
                                }}
                            />
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: "primary.dark",
                                    mb: 1,
                                }}
                            >
                                Chào mừng trở lại
                            </Typography>
                            <Typography
                                variant="body1"
                                color="text.secondary"
                                sx={{ fontSize: "1.1rem" }}
                            >
                                Đăng nhập để tiếp tục hành trình học tập của bạn
                            </Typography>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={handleLogin}
                            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
                        >
                            <TextField
                                label="Email"
                                type="email"
                                variant="outlined"
                                fullWidth
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: "primary.main" }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: theme.shape.borderRadius,
                                        backgroundColor:
                                            theme.palette.mode === "dark"
                                                ? alpha(theme.palette.neutral[800], 0.5)
                                                : alpha(theme.palette.neutral[100], 0.8),
                                    },
                                }}
                            />
                            <TextField
                                label="Mật khẩu"
                                type={showPassword ? "text" : "password"}
                                variant="outlined"
                                fullWidth
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Lock sx={{ color: "primary.main" }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{
                                    "& .MuiOutlinedInput-root": {
                                        borderRadius: theme.shape.borderRadius,
                                        backgroundColor:
                                            theme.palette.mode === "dark"
                                                ? alpha(theme.palette.neutral[800], 0.5)
                                                : alpha(theme.palette.neutral[100], 0.8),
                                    },
                                }}
                            />
                            <StyledButton type="submit" fullWidth disabled={loading}>
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    "Đăng nhập"
                                )}
                            </StyledButton>
                            <Box sx={{ textAlign: "center", mt: 2 }}>
                                <Typography variant="body2" color="text.secondary">
                                    Chưa có tài khoản?{" "}
                                    <Button
                                        component={Link}
                                        to="/register"
                                        variant="text"
                                        sx={{
                                            color: "secondary.main",
                                            fontWeight: 600,
                                            textTransform: "none",
                                            "&:hover": {
                                                backgroundColor: "transparent",
                                                textDecoration: "underline",
                                            },
                                        }}
                                    >
                                        Đăng ký ngay
                                    </Button>
                                </Typography>
                            </Box>
                        </Box>
                    </FormPaper>
                </Fade>
            </Container>
            
            <AppSnackbar
                open={toast.open}
                message={toast.message}
                severity={toast.severity}
                onClose={handleCloseToast}
            />
        </PageWrapper>
    );
};

export default LoginPage;