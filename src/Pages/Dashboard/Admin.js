import axios from 'axios';
import Swal from 'sweetalert2';

const { discordUrl, apiUrl } = require('../../config/config.json');

export default function Admin() {
    async function getIdByName(username) {
        return await axios
            .get(apiUrl + "/users")
            .then(({ data }) => {
                return (data.find((u) => u.username === username) || { id: null }).id;
            });
    }

    async function banUser() {
        const user = document.getElementById('usernameBan').value;
        const dateText = document.getElementById('dateBan').value;

        if (!user || !dateText) return;

        const id = await getIdByName(user);
        if (!id) {
            return Swal.fire({
                title: 'User Error',
                text: "This user doesn't exist!",
                icon: 'error',
                animation: true
            });
        };

        const date = new Date(dateText);

        if (new Date() >= date) {
            return Swal.fire({
                title: 'Date Error',
                text: 'This date has already passed!',
                icon: 'error',
                animation: true
            });
        }

        Swal.fire({
            title: 'Ban @' + user + '?',
            text: `They won't be able to access DisFuse until ${dateText}!`,
            icon: 'warning',
            showCancelButton: true,
            animation: true,
            confirmButtonText: 'Ban',
        }).then((response) => {
            if (response.isConfirmed) {
                axios
                    .put(
                        apiUrl + '/users/' + id + '/ban',
                        {
                            banUntil: date
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem("disfuse-token"),
                            },
                        }
                    )
                    .then(() => {
                        Swal.fire({
                            title: 'Ban Successful',
                            text: '@' + user + ' has been banned!',
                            icon: 'success',
                            animation: true
                        });
                    })
            }
        });
    }

    async function unbanUser() {
        const user = document.getElementById('usernameBan').value;
        if (!user) return;

        const id = await getIdByName(user);
        if (!id) {
            return Swal.fire({
                title: 'User Error',
                text: "This user doesn't exist!",
                icon: 'error',
                animation: true
            });
        };

        Swal.fire({
            title: 'Unban @' + user + '?',
            icon: 'warning',
            showCancelButton: true,
            animation: true,
            confirmButtonText: 'Ban',
        }).then((response) => {
            if (response.isConfirmed) {
                axios
                    .put(
                        apiUrl + '/users/' + id + '/ban',
                        {
                            banUntil: new Date(0)
                        },
                        {
                            headers: {
                                Authorization: localStorage.getItem("disfuse-token"),
                            },
                        }
                    )
                    .then(() => {
                        Swal.fire({
                            title: 'Unban Successful',
                            text: '@' + user + ' has been unbanned!',
                            icon: 'success',
                            animation: true
                        });
                    })
            }
        });
    }

    return (
        <div className="adminDashboard-container">
            <div className="head">
                <i class="fa-solid fa-user-tie"></i> Admin Dashboard
            </div>

            <div className="inline">
                <label htmlFor='usernameBan'>Username of user to ban:</label>
                <input type='text' id='usernameBan' />
            </div>

            <div className="inline">
                <label htmlFor='dateBan'>Ban until date:</label>
                <input type='date' id='dateBan' />
            </div>

            <div className="inline">
                <button onClick={banUser} id="red">
                    <i class="fa-solid fa-ban"></i> Ban User
                </button>

                <button onClick={unbanUser}>
                    <i class="fa-solid fa-thumbs-up"></i> Unban User
                </button>
            </div>
        </div>
    );
}
