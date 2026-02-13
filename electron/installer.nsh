!macro customInit
  ; Check if MongoDB is accessible (optional - just a warning)
!macroend

!macro customInstall
  ; Create .env file in backend directory with default database
  FileOpen $0 "$INSTDIR\resources\backend\.env" w
  FileWrite $0 'DATABASE=mongodb://localhost:27017/carpentry-workshop$\r$\n'
  FileWrite $0 'JWT_SECRET=carpentry-workshop-secret-2024$\r$\n'
  FileWrite $0 'NODE_ENV=production$\r$\n'
  FileWrite $0 "OPENSSL_CONF=/dev/null$\r$\n"
  FileWrite $0 'PUBLIC_SERVER_FILE=http://localhost:8888/$\r$\n'
  FileWrite $0 'PORT=8888$\r$\n'
  FileClose $0
!macroend
