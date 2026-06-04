import "../../styles/auth.css";

import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useLogin } from "../../hooks/useAuth";

const schema = yup.object({
  email: yup
    .string()
    .email("Invalid Email")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required"),
});

function LoginForm() {
  const navigate = useNavigate();

  const { mutate, isPending } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (response) => {
        if (response?.user?.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      },
    });
  };

  return (
    <form
      className="auth-form"
      onSubmit={handleSubmit(onSubmit)}
    >
      <h2>Welcome Back</h2>

      <div className="form-group">
        <input
          type="email"
          placeholder="Email Address"
          {...register("email")}
        />
        <span>{errors.email?.message}</span>
      </div>

      <div className="form-group">
        <input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        <span>{errors.password?.message}</span>
      </div>

      <button
        className="auth-btn"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Logging In..." : "Login"}
      </button>

      <p className="auth-link">
        Don't have an account?
        <Link to="/register"> Register</Link>
      </p>
    </form>
  );
}

export default LoginForm;