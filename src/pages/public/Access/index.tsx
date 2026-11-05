import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Button from "@/components/Base/Button";
import { FormInput, FormLabel } from "@/components/Base/Form";
import LoadingIcon from "@/components/Base/LoadingIcon";
import { Logo } from "../Return/components/Logo";

import { useAppSelector, useAppDispatch } from "@/stores/hooks";
import {
  selectParentsAuth,
  requestAccessCode,
  submitAccessCode,
  clearError,
} from "@/stores/ParentsAuth/slice";

function Access() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { status, errorMessage, codeSent, authorized, parent } = useAppSelector(selectParentsAuth);

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const isLoading = status === "loading";

  useEffect(() => {
    if (authorized) navigate("/dashboard", { replace: true });
  }, [authorized]);

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    await dispatch(requestAccessCode(email));
  };

  const handleCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 8) return;
    await dispatch(submitAccessCode(code));
  };

  return (
    <div className="grid grid-cols-12 gap-y-10 gap-x-6 mt-4">
      <div className="col-span-12 sm:col-span-6 sm:col-start-4 max-w-xl w-full mx-auto px-4 sm:px-0">
        <div className="flex justify-center items-center">
          <Logo />
        </div>

        <div className="box p-8 mt-8">
          <h1 className="text-xl font-medium text-center mb-2">Reagendamientos</h1>

          {!codeSent ? (
            <form onSubmit={handleEmail}>
              <p className="text-slate-500 text-center mb-6">
                Ingresa el email del apoderado para recibir un código de acceso
              </p>
              <FormLabel htmlFor="email">Email del apoderado</FormLabel>
              <FormInput
                id="email"
                type="email"
                value={email}
                placeholder="apoderado@email.com"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setEmail(e.target.value);
                  errorMessage && dispatch(clearError());
                }}
              />
              {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
              <Button
                type="submit"
                variant="primary"
                rounded
                disabled={isLoading || !email}
                className="w-full mt-6 py-3"
              >
                {isLoading ? (
                  <LoadingIcon color="#FFFFFF" icon="three-dots" className="w-8 h-8" />
                ) : (
                  "Enviar código"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleCode}>
              <p className="text-slate-500 text-center mb-6">
                Enviamos un código de 8 dígitos a <b>{parent?.email}</b>. Ingrésalo para continuar.
              </p>
              <FormLabel htmlFor="code">Código de acceso</FormLabel>
              <FormInput
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={8}
                value={code}
                placeholder="12345678"
                className="text-center text-2xl tracking-[0.5em]"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setCode(e.target.value.replace(/\D/g, ""));
                  errorMessage && dispatch(clearError());
                }}
              />
              {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
              <Button
                type="submit"
                variant="primary"
                rounded
                disabled={isLoading || code.length !== 8}
                className="w-full mt-6 py-3"
              >
                {isLoading ? (
                  <LoadingIcon color="#FFFFFF" icon="three-dots" className="w-8 h-8" />
                ) : (
                  "Ingresar"
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default Access;
