import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { RootState } from "../store";
import {
  fetchParentByEmail,
  createAuthorizationCode,
  sendCodeEmail,
  validateCode,
  fetchStudentsWithSessions,
  fetchLocations,
} from "./services";

export interface ParentsAuthState {
  status: "idle" | "loading" | "failed";
  errorMessage: string;
  parent: { id: string; name: string; email: string } | null;
  codeSent: boolean;
  authorized: boolean;
  relationships: any[];
  locations: Record<string, any>;
}

const persisted = (() => {
  try {
    return JSON.parse(sessionStorage.getItem("parentsAuth") || "null");
  } catch {
    return null;
  }
})();

const initialState: ParentsAuthState = {
  status: "idle",
  errorMessage: "",
  parent: persisted?.parent ?? null,
  codeSent: false,
  authorized: persisted?.authorized ?? false,
  relationships: [],
  locations: {},
};

// Paso 1: validar email de apoderado (roleId === "parents"), crear código y enviarlo
export const requestAccessCode = createAsyncThunk(
  "parentsAuth/requestCode",
  async (email: string, { rejectWithValue }) => {
    const user = await fetchParentByEmail(email.trim().toLowerCase());
    if (!user) return rejectWithValue("No existe un apoderado con ese email");
    if (user.roleId !== "parents") return rejectWithValue("El email no corresponde a un apoderado");
    const auth = await createAuthorizationCode(user.id);
    if (!auth?.code) return rejectWithValue("No se pudo generar el código");
    try {
      await sendCodeEmail({ email: user.email, name: user.name, code: auth.code });
    } catch (e) {
      console.error("emailjs error", e);
      return rejectWithValue("No se pudo enviar el email con el código");
    }
    return { parent: { id: user.id, name: user.name, email: user.email } };
  }
);

// Paso 2: validar código ingresado
export const submitAccessCode = createAsyncThunk(
  "parentsAuth/submitCode",
  async (code: string, { rejectWithValue }) => {
    const item = await validateCode(code.trim());
    if (!item) return rejectWithValue("Código inválido o ya utilizado");
    const parent = { id: item.userId, name: item.user?.name ?? "", email: item.user?.email ?? "" };
    sessionStorage.setItem("parentsAuth", JSON.stringify({ parent, authorized: true }));
    return { parent };
  }
);

// Dashboard: estudiantes relacionados con enrollments y sesiones ACTIVE
export const loadDashboard = createAsyncThunk(
  "parentsAuth/loadDashboard",
  async (userId: string) => {
    const [relationships, locations] = await Promise.all([
      fetchStudentsWithSessions(userId),
      fetchLocations(),
    ]);
    return { relationships, locations };
  }
);

export const parentsAuthSlice = createSlice({
  name: "parentsAuth",
  initialState,
  reducers: {
    logout(state) {
      sessionStorage.removeItem("parentsAuth");
      state.parent = null;
      state.authorized = false;
      state.codeSent = false;
      state.relationships = [];
    },
    clearError(state) {
      state.errorMessage = "";
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(requestAccessCode.pending, (s) => { s.status = "loading"; s.errorMessage = ""; })
      .addCase(requestAccessCode.fulfilled, (s, a) => {
        s.status = "idle";
        s.parent = a.payload.parent;
        s.codeSent = true;
      })
      .addCase(requestAccessCode.rejected, (s, a) => {
        s.status = "failed";
        s.errorMessage = (a.payload as string) || a.error?.message || "Error";
      })
      .addCase(submitAccessCode.pending, (s) => { s.status = "loading"; s.errorMessage = ""; })
      .addCase(submitAccessCode.fulfilled, (s, a) => {
        s.status = "idle";
        s.parent = a.payload.parent;
        s.authorized = true;
      })
      .addCase(submitAccessCode.rejected, (s, a) => {
        s.status = "failed";
        s.errorMessage = (a.payload as string) || a.error?.message || "Error";
      })
      .addCase(loadDashboard.pending, (s) => { s.status = "loading"; })
      .addCase(loadDashboard.fulfilled, (s, a) => {
        s.status = "idle";
        s.relationships = a.payload.relationships;
        s.locations = a.payload.locations;
      })
      .addCase(loadDashboard.rejected, (s, a) => {
        s.status = "failed";
        s.errorMessage = a.error?.message || "Error al cargar datos";
      });
  },
});

export const { logout, clearError } = parentsAuthSlice.actions;
export const selectParentsAuth = (state: RootState) => state.parentsAuth;
export default parentsAuthSlice.reducer;
