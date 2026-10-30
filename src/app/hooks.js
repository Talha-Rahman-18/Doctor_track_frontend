import { useDispatch, useSelector } from "react-redux";

// Thin wrappers so components never import react-redux directly (one place to change later).
export const useAppDispatch = useDispatch;
export const useAppSelector = useSelector;
