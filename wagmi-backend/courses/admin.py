from django.contrib import admin
from django.utils.html import format_html
from .models import Course, Lesson, Enrollment, Section, SovereignSchool, Certificate


@admin.register(SovereignSchool)
class SovereignSchoolAdmin(admin.ModelAdmin):
    list_display = ('name', 'etherscan_link', 'instructor_wallet', 'course_count', 'created_at')
    search_fields = ('name', 'address', 'instructor__address', 'instructor__display_name')
    readonly_fields = ('etherscan_link', 'created_at')

    def instructor_wallet(self, obj):
        return obj.instructor.address if obj.instructor else '—'
    instructor_wallet.short_description = 'Owner Wallet'

    def etherscan_link(self, obj):
        if obj.address:
            url = f'https://sepolia.etherscan.io/address/{obj.address}'
            short = f'{obj.address[:8]}...{obj.address[-6:]}'
            return format_html('<a href="{}" target="_blank">{}</a>', url, short)
        return '—'
    etherscan_link.short_description = 'Contract Address (CA)'

    def course_count(self, obj):
        return obj.courses.count()
    course_count.short_description = '# Courses'


@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'title', 'instructor_wallet', 'school_name',
        'contract_address_link', 'price', 'is_minted', 'tx_hash_short', 'created_at'
    )
    list_display_links = ('id', 'title')
    list_filter = ('is_minted', 'created_at')
    search_fields = ('title', 'school_name', 'school_address', 'instructor__address', 'instructor__display_name', 'tx_hash')
    readonly_fields = ('id', 'created_at', 'contract_address_link', 'tx_hash_link', 'instructor_wallet_link', 'enrollment_count')
    ordering = ('-created_at',)

    fieldsets = (
        ('📚 Course Info', {
            'fields': ('id', 'title', 'description', 'price', 'image_url', 'created_at')
        }),
        ('👤 Ownership', {
            'fields': ('instructor', 'instructor_wallet_link')
        }),
        ('⛓️ Blockchain', {
            'fields': ('is_minted', 'school', 'school_name', 'school_address', 'contract_address_link', 'tx_hash', 'tx_hash_link')
        }),
        ('📊 Stats', {
            'fields': ('enrollment_count',)
        }),
    )

    def instructor_wallet(self, obj):
        return obj.instructor.address if obj.instructor else '—'
    instructor_wallet.short_description = 'Owner Wallet'

    def instructor_wallet_link(self, obj):
        if obj.instructor and obj.instructor.address:
            addr = obj.instructor.address
            url = f'https://sepolia.etherscan.io/address/{addr}'
            return format_html('<a href="{}" target="_blank">{}</a>', url, addr)
        return '—'
    instructor_wallet_link.short_description = 'Owner Wallet (Etherscan)'

    def contract_address_link(self, obj):
        addr = obj.school_address
        if addr:
            url = f'https://sepolia.etherscan.io/address/{addr}'
            short = f'{addr[:8]}...{addr[-6:]}'
            return format_html('<a href="{}" target="_blank">{}</a> <small style="color:#999">({})</small>', url, short, addr)
        return '—'
    contract_address_link.short_description = 'Contract Address (CA)'

    def tx_hash_short(self, obj):
        if obj.tx_hash:
            return f'{obj.tx_hash[:10]}...'
        return '—'
    tx_hash_short.short_description = 'Mint Tx'

    def tx_hash_link(self, obj):
        if obj.tx_hash:
            url = f'https://sepolia.etherscan.io/tx/{obj.tx_hash}'
            return format_html('<a href="{}" target="_blank">{}</a>', url, obj.tx_hash)
        return '—'
    tx_hash_link.short_description = 'Mint Tx (Etherscan)'

    def enrollment_count(self, obj):
        return obj.enrollments.count()
    enrollment_count.short_description = 'Total Enrollments'


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order')
    search_fields = ('title', 'course__title')


@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'section', 'order')
    search_fields = ('title', 'section__title', 'section__course__title')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('user', 'course', 'wallet_address', 'status', 'tx_hash_short', 'enrolled_at')
    list_filter = ('status', 'enrolled_at')
    search_fields = ('user__address', 'course__title', 'wallet_address', 'tx_hash')
    readonly_fields = ('enrolled_at', 'tx_hash_link')

    def tx_hash_short(self, obj):
        if obj.tx_hash and obj.tx_hash.startswith('0x'):
            return f'{obj.tx_hash[:10]}...'
        return obj.tx_hash or '—'
    tx_hash_short.short_description = 'Tx Hash'

    def tx_hash_link(self, obj):
        if obj.tx_hash and obj.tx_hash.startswith('0x'):
            url = f'https://sepolia.etherscan.io/tx/{obj.tx_hash}'
            return format_html('<a href="{}" target="_blank">{}</a>', url, obj.tx_hash)
        return obj.tx_hash or '—'
    tx_hash_link.short_description = 'Transaction (Etherscan)'


@admin.register(Certificate)
class CertificateAdmin(admin.ModelAdmin):
    list_display = ('token_id', 'user', 'course', 'wallet_address', 'issued_at')
    search_fields = ('token_id', 'user__address', 'course__title', 'wallet_address')
    readonly_fields = ('issued_at',)

