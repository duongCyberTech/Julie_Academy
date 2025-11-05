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
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    styled,
    useTheme,
    alpha,
} from "@mui/material";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import {
    Email,
    Lock,
    Visibility,
    VisibilityOff,
    Person,
} from "@mui/icons-material";
import AppSnackbar from '../../components/Snackbar'; 
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
    transition: "transform 0.3s ease, box-shadow 0.3s ease",
    "&:hover": {
        transform: "translateY(-4px)",
        boxShadow: theme.shadows[8],
    },
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

const RegisterPage = () => {
    const theme = useTheme();
    const [formData, setFormData] = useState({
        fname: "",
        lname: "",
        mname: "",
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "student",
        status: "active",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [toast, setToast] = useState({ open: false, message: "", severity: "success" });
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const validatePassword = (password) => {
        if (password.length < 8) return "Mật khẩu phải có ít nhất 8 ký tự";
        if (!/[a-z]/.test(password)) return "Mật khẩu phải chứa ít nhất 1 chữ thường";
        if (!/[A-Z]/.test(password)) return "Mật khẩu phải chứa ít nhất 1 chữ hoa";
        if (!/\d/.test(password)) return "Mật khẩu phải chứa ít nhất 1 số";
        if (!/[@$!%*?&]/.test(password)) return "Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)";
        return "";
    };

    const handleSignUp = async (event) => {
        event.preventDefault();
        setToast(prev => ({ ...prev, open: false }));

        if (!formData.fname || !formData.lname || !formData.username || !formData.email || !formData.password) {
            setToast({ open: true, message: "Vui lòng điền đầy đủ thông tin bắt buộc", severity: 'warning' });
            return;
        }
        if (formData.password !== formData.confirmPassword) {
            setToast({ open: true, message: "Mật khẩu và xác nhận mật khẩu không khớp", severity: 'error' });
            return;
        }
        const passwordError = validatePassword(formData.password);
        if (passwordError) {
            setToast({ open: true, message: passwordError, severity: 'error' });
            return;
        }

        setLoading(true);
        try {
            const { confirmPassword, ...registerData } = formData;
            const response = await axios.post(
                "http://localhost:4000/auth/register",
                registerData
            );
            if (response.data) {
                setToast({
                    open: true,
                    message: "Đăng ký thành công! Vui lòng đăng nhập.",
                    severity: 'success'
                });
                
                setTimeout(() => {
                    navigate("/login");
                }, 1000); 
            }
        } catch (err) {
            console.error("Lỗi đăng ký:", err);
            const errorMessage = err.response?.data?.message || "Đã xảy ra lỗi. Vui lòng thử lại!";

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

    const textFieldSx = {
        "& .MuiOutlinedInput-root": {
            borderRadius: theme.shape.borderRadius,
            backgroundColor:
                theme.palette.mode === "dark"
                    ? alpha(theme.palette.neutral[800], 0.5)
                    : alpha(theme.palette.neutral[100], 0.8),
        },
    };

    return (
        <PageWrapper>
            <Container maxWidth="sm" sx={{ py: 4 }}>
                <Fade in={true} timeout={600}>
                    <FormPaper elevation={0}>
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
                                Tạo tài khoản mới
                            </Typography>
                            <Typography variant="body1" color="text.secondary">
                                Hãy bắt đầu hành trình học tập của bạn ngay hôm nay
                            </Typography>
                        </Box>

                        <Box
                            component="form"
                            onSubmit={handleSignUp}
                            sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}
                        >
                            <Box sx={{ display: "flex", gap: 2 }}>
                                <TextField
                                    label="Họ"
                                    name="lname"
                                    value={formData.lname}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                    sx={textFieldSx}
                                />
                                <TextField
                                    label="Tên đệm"
                                    name="mname"
                                    value={formData.mname}
                                    onChange={handleChange}
                                    fullWidth
                                    sx={textFieldSx}
                                />
                                <TextField
                                    label="Tên"
                                    name="fname"
                                    value={formData.fname}
                                    onChange={handleChange}
                                    required
                                    fullWidth
                                    sx={textFieldSx}
                                />
                            </Box>

                            <TextField
                                label="Tên đăng nhập"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                required
                                fullWidth
                                sx={textFieldSx}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Person sx={{ color: "text.secondary" }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                fullWidth
                                sx={textFieldSx}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Email sx={{ color: "text.secondary" }} />
                                        </InputAdornment>
                                    ),
                                }}
                            />

                            <FormControl fullWidth sx={textFieldSx}>
                                <InputLabel>Vai trò</InputLabel>
                                <Select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    label="Vai trò"
                                >
                                    <MenuItem value="student">Học sinh</MenuItem>
                                    <MenuItem value="tutor">Gia sư</MenuItem>
                                    <MenuItem value="parent">Phụ huynh</MenuItem>
                                </Select>
                            </FormControl>

                            <TextField
                                label="Mật khẩu"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={handleChange}
                                required
                                fullWidth
                                sx={textFieldSx}
                                helperText="Ít nhất 8 ký tự, có chữ hoa, thường, số và ký tự đặc biệt"
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <TextField
                                label="Xác nhận mật khẩu"
                                name="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                required
                                fullWidth
                                sx={textFieldSx}
                                InputProps={{
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() =>
                                                    setShowConfirmPassword(!showConfirmPassword)
                                                }
                                                edge="end"
                                                aria-label="toggle password visibility"
                                            >
                                                {showConfirmPassword ? (
                                                    <VisibilityOff />
                                                ) : (
                                                    <Visibility />
                                                )}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                            />
                            <StyledButton type="submit" fullWidth disabled={loading}>
                                {loading ? (
                                    <CircularProgress size={26} color="inherit" />
                                ) : (
                                    "Đăng ký"
                                )}
                            </StyledButton>

                            <Typography
                                variant="body2"
                                color="text.secondary"
                                align="center"
                                sx={{ mt: 2 }}
                            >
                                Đã có tài khoản?{" "}
                                <Button
                                    component={Link}
                                    to="/login"
                                    sx={{
                                        color: "secondary.main",
                                        fontWeight: 600,
                                        textTransform: "none",
                                    }}
                                >
                                    Đăng nhập ngay
                                </Button>
                            </Typography>
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

export default RegisterPage;