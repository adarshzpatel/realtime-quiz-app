import { UserManager } from "./managers/UserManager";
import { IoManager } from "./managers/ioManager"


const io = IoManager.getIo();

io.listen(3000);

const userManager = new UserManager();

io.on('connection', (socket) => {
  userManager.addUser(socket);
});
  