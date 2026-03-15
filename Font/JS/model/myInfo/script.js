

// 压缩图片
function compressImage(file, quality = 0.8, maxWidth = 1024) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 等比例缩放
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                // 转换为 Blob
                canvas.toBlob(
                    (blob) => resolve(blob),
                    file.type,
                    quality
                );
            };
            
            img.onerror = reject;
        };
        
        reader.onerror = reject;
    });
}
//************************************************************ */



// 检查登录状态
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('请先登录');
        window.location.href = '../login/login.html';
    }
    return token;
}

// 获取当前用户信息
async function getUserInfo() {
    const token = checkAuth();
    try {
        const response = await fetch('http://localhost:3000/api/auth/check-auth', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        const data = await response.json();
        if (response.ok) {
            return data.user;
        } else {
            throw new Error(data.message);
        }
    } catch (error) {
        console.error('获取用户信息失败:', error);
        alert('获取用户信息失败，请重新登录');
        window.location.href = '../login/login.html';
        return null;
    }
}




// 填充表单数据
async function fillForm() {
    const userInfo = await getUserInfo();
    if (userInfo) {
        document.getElementById('username').value = userInfo.username || '';
        
        // 如果用户有头像，显示头像预览
        if (userInfo.avatar) {
            showAvatarPreview(userInfo.avatar);
        }
    }
}

// 显示头像预览
function showAvatarPreview(avatarData) {
    let previewContainer = document.getElementById('avatar-preview');
    
    // 如果预览容器不存在，创建它
    if (!previewContainer) {
        const avatarGroup = document.getElementById('useravatar').closest('.form-group');
        previewContainer = document.createElement('div');
        previewContainer.id = 'avatar-preview';
        previewContainer.className = 'avatar-preview';
        avatarGroup.appendChild(previewContainer);
    }
    
    // 显示头像图片
    previewContainer.innerHTML = `
        <img src="${avatarData}" alt="头像预览" class="preview-image">
        <button type="button" class="remove-avatar-btn" onclick="removeAvatar()">删除头像</button>
    `;
}

// 删除头像
function removeAvatar() {
    const previewContainer = document.getElementById('avatar-preview');
    if (previewContainer) {
        previewContainer.remove();
    }
    document.getElementById('useravatar').value = '';
}

// 处理头像文件选择和预览
function handleAvatarSelect(event) {
    const file = event.target.files[0];
    compressImage(file);
    
    if (!file) return;
    
    // 验证文件类型
    if (!file.type.startsWith('image/')) {
        alert('请选择图片文件');
        event.target.value = '';
        return;
    }
    
    // 验证文件大小（限制为5MB）
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
        alert('图片大小不能超过5MB');
        event.target.value = '';
        return;
    }
    
    // 读取文件并显示预览
    const reader = new FileReader();
    reader.onload = function(e) {
        showAvatarPreview(e.target.result);
    };
    reader.readAsDataURL(file);
}




// 提交表单
async function submitForm(e) {
    e.preventDefault();
    
    const token = checkAuth();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const avatarFile = document.getElementById('useravatar').files[0];
    
    // 构建表单数据
    const formData = {
        username
    };
    
    // 如果填写了密码，添加到表单数据
    if (password) {
        formData.password = password;
    }
    
    // 如果上传了用户头像，处理头像上传
    if (avatarFile) {
        try {
            // 将文件转换为 Base64 编码
            const base64Data = await fileToBase64(avatarFile);
            formData.useravatar = {
                data: base64Data,
                filename: avatarFile.name,
                mimetype: avatarFile.type
            };
        } catch (error) {
            console.error('头像处理失败:', error);
            alert('头像处理失败，请重试');
            return;
        }
    } else {
        // 检查是否删除了头像（用户点击了删除按钮但没有上传新头像）
        const previewContainer = document.getElementById('avatar-preview');
        if (!previewContainer) {
            formData.removeAvatar = true;
        }
    }
    
    try {
        const response = await fetch('http://localhost:3000/api/info/update-info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        console.log('用户修改信息:', data);
        if (response.ok) {
            alert('个人信息修改成功');
            window.location.href = '../../index.html';
        } else {
            alert('修改失败: ' + data.message);
        }
    } catch (error) {
        console.error('修改个人信息失败:', error);
        alert('修改个人信息失败，请稍后重试');
    }
}

// 将文件转换为 Base64 编码
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            // 去掉 Base64 前缀（如 "data:image/png;base64,"）
            const base64String = reader.result.split(',')[1];
            resolve(base64String);
        };
        reader.onerror = error => reject(error);
    });
}

// 关闭弹窗
function closeModal() {
    window.location.href = '../../index.html';
}

// 初始化页面
async function init() {
    await fillForm();
    
    // 绑定事件
    document.getElementById('info-form').addEventListener('submit', submitForm);
    document.getElementById('close-btn').addEventListener('click', closeModal);
    document.getElementById('cancel-btn').addEventListener('click', closeModal);
    
    // 绑定头像文件选择事件
    document.getElementById('useravatar').addEventListener('change', handleAvatarSelect);
    
    // 点击遮罩层关闭弹窗
    document.getElementById('modal-overlay').addEventListener('click', function(e) {
        if (e.target === this) {
            closeModal();
        }
    });
}

// 页面加载完成后初始化
window.addEventListener('DOMContentLoaded', init);