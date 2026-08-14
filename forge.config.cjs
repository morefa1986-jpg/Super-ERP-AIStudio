const path = require("node:path");
const { MakerSquirrel } = require("@electron-forge/maker-squirrel");

const certificateFile = process.env.WINDOWS_CERTIFICATE_FILE;
const certificatePassword = process.env.WINDOWS_CERTIFICATE_PASSWORD;

module.exports = {
  packagerConfig: {
    asar: true,
    executableName: "FathiAquaSuperERP",
    appBundleId: "ir.fathiaqua.supererp",
    appCopyright: "Copyright Fathi Aqua",
    win32metadata: {
      CompanyName: "Fathi Aqua",
      FileDescription: "Fathi Aqua Super ERP - Offline Aquaculture Management",
      ProductName: "Fathi Aqua Super ERP",
      InternalName: "FathiAquaSuperERP",
      OriginalFilename: "FathiAquaSuperERP.exe",
    },
    osxSign: false,
    ...(certificateFile && certificatePassword
      ? { windowsSign: { certificateFile, certificatePassword } }
      : {}),
  },
  makers: [
    new MakerSquirrel({
      name: "FathiAquaSuperERP",
      setupExe: "Fathi-Aqua-SuperERP-Setup.exe",
      setupMsi: "Fathi-Aqua-SuperERP.msi",
      authors: "Fathi Aqua",
      description: "سامانه آفلاین مدیریت مزرعه ماهیان خاویاری فتحی",
      noMsi: false,
    }),
  ],
};
